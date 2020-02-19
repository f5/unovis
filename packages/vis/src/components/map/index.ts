// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, event } from 'd3-selection'
import { packSiblings } from 'd3-hierarchy'
import L from 'leaflet'
import Supercluster from 'supercluster'

// Model
import { MapDataModel } from 'data-models/map'

// Types
import { MapRenderer, Point, Bounds } from 'types/map'

// Utils
import { isNil, findIndex, find } from 'utils/data'

// Config
import { MapConfig } from './config'

// Styles
import * as s from './style'

// Modules
import { setupMap } from './modules/map'
import { createNodes, updateNodes, removeNodes } from './modules/node'
import { createNodeSelectionRing, updateNodeSelectionRing } from './modules/selectionRing'
import { createBackgroundNode, updateBackgroundNode } from './modules/clusterBackground'
import {
  bBoxMerge, clampZoomLevel, getNodeRadius, getPointDisplayOrder, calulateClusterIndex, geoJSONPointToScreenPoint,
  shouldClusterExpand, findNodeAndClusterInPointsById, getNodeRelativePosition, getClusterRadius, getClusterPoints,
} from './modules/utils'

export class Map<Datum> {
  static selectors = s
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  config: MapConfig<Datum> = new MapConfig()
  datamodel: MapDataModel<Datum> = new MapDataModel()
  protected _container: HTMLElement
  private _leaflet: { map: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> }
  private _clusterIndex: Supercluster
  private _expandedCluster = null
  private _cancelBackgroundClick = false
  private _hasBeenMoved = false
  private _hasBeenZoomed = false
  private _triggerBackroundClick = false
  private _externallySelectedNode = null
  private _zoomingToExternallySelectedNode = false
  private _forceExpandCluster = false
  private _nodesGroup: Selection<SVGGElement, object[], SVGElement, object[]>
  private _nodeSelectionRing: Selection<SVGGElement, object[], SVGElement, object[]>
  private _clusterBackground: Selection<SVGGElement, object[], SVGElement, object[]>
  private _clusterBackgroundRadius = 0
  private _selectedNode = null
  private _currentZoomLevel = null

  events = {
    [Map.selectors.node]: {
      // mousemove: this._onMousemoveNode,
      // mouseover: this._onMouseoverNode,
      // mouseout: this._onMouseoutNode,
      mouseup: this._onMouseupNode,
      mousedown: this._onMousedownNode,
      click: this._onNodeClick,
    },
  }

  constructor (element: HTMLElement, config?: MapConfig<Datum>, data?: Datum[]) {
    this._container = element

    this.div = select(this._container).append('div').attr('class', s.mapContainer)
    this.element = this.div.node()

    if (config) this.setConfig(config)

    this._leaflet = setupMap(this.element, this.config)
    this._leaflet.map.on('drag', this._onMapDragLeaflet.bind(this))
    this._leaflet.map.on('move', this._onMapMove.bind(this))
    this._leaflet.map.on('moveend', this._onMapMoveEnd.bind(this))
    this._leaflet.map.on('zoom', this._onMapZoom.bind(this))

    // We need to handle background click in a special way to deal
    //   with d3 svg overlay that might have smaller size than the map itself
    //   (see this._onMousedownNode() and this this._onMousedownNode())
    this._leaflet.map.on('mousedown', () => {
      if (!this._cancelBackgroundClick) this._triggerBackroundClick = true
    })

    this._leaflet.map.on('mouseup', (e) => {
      if (this._triggerBackroundClick) {
        this._triggerBackroundClick = false
        const originalEvent = (e as any).originalEvent
        this._onBackgroundClick(null, originalEvent.target, originalEvent)
      }
    })

    this._leaflet.svgOverlay
      .attr('class', s.svgOverlay)
      .insert('rect', ':first-child')
      .attr('class', s.backgroundRect)
      .attr('width', '100%')
      .attr('height', '100%')

    this._nodesGroup = this._leaflet.svgGroup.append('g').attr('class', s.nodes)
    this._nodeSelectionRing = this._nodesGroup.append('g')
      .attr('class', s.nodeSelectionRing)
      .call(createNodeSelectionRing)
    this._clusterBackground = this._nodesGroup.append('g')
      .attr('class', s.clusterBackground)
      .call(createBackgroundNode)

    if (data) this.setData(data)
  }

  setConfig (config: MapConfig<Datum>): void {
    this.config.init(config)
  }

  setData (data): void {
    this.datamodel.data = data
    this._clusterIndex = calulateClusterIndex(data, this.config)
    this.render()
  }

  render (): void {
    if (!this._leaflet) return
    this._renderData()
  }

  fitToPoints (duration = this.config.flyToDuration, padding = [40, 40]): void {
    const { config, datamodel, datamodel: { data } } = this

    if (!this._leaflet || !this._leaflet.map) return
    if (!data.length) return
    const bounds = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    this._flyToBounds(bounds, duration, padding)
  }

  fitToBounds (bounds: Bounds, duration = this.config.flyToDuration): void {
    const { northEast, southWest } = bounds || this.config.bounds
    if (isNil(northEast) || isNil(southWest)) return
    if (isNil(northEast.lat) || isNil(northEast.lng)) return
    if (isNil(southWest.lat) || isNil(southWest.lng)) return
    if (!this._leaflet || !this._leaflet.map) return
    this._flyToBounds([
      [northEast.lat, southWest.lng],
      [southWest.lat, northEast.lng],
    ], duration)
  }

  zoomToNodeById (id: number | string, selectNode = false, customZoomLevel: number): void {
    const { config, datamodel } = this
    this._resetExpandedCluster()

    const dataBoundsAll = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    const bounds = [dataBoundsAll[0][1], dataBoundsAll[1][0], dataBoundsAll[1][1], dataBoundsAll[0][0]]
    const pointDataAll = this._getScreenPointData(bounds)

    let foundNode = find(pointDataAll, (d: Point) => d.properties.id === id)
    if (!foundNode) {
      const { node } = findNodeAndClusterInPointsById(pointDataAll, id)
      foundNode = node
    }
    if (foundNode) {
      this._externallySelectedNode = foundNode
      this._zoomingToExternallySelectedNode = true
      if (selectNode) this._selectedNode = foundNode
      this._forceExpandCluster = !isNil(customZoomLevel)
      const zoomLevel = isNil(customZoomLevel) ? this._leaflet.map.getZoom() : customZoomLevel
      const coordinates = { lng: foundNode.properties.longitude, lat: foundNode.properties.latitude }
      this._leaflet.map.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      console.warn(`Node with index ${id} can not be found`)
    }
  }

  getNodeRelativePosition (node): { x: number; y: number } {
    return getNodeRelativePosition(node, this._leaflet.map)
  }

  get hasBeenZoomed (): boolean {
    return this._hasBeenZoomed
  }

  get hasBeenMoved (): boolean {
    return this._hasBeenMoved
  }

  _flyToBounds (bounds, duration, padding?): void {
    if (duration) {
      this._leaflet.map.flyToBounds(bounds, {
        duration: duration / 1000,
        padding,
      })
    } else {
      this._leaflet.map.fitBounds(bounds, { padding })
    }
  }

  _renderData (): void {
    const { config } = this

    const pointData = this._getScreenPointData()
    const contentBBox = pointData.length ? bBoxMerge(pointData.map(d => d.bbox)) : { x: 0, y: 0, width: 0, height: 0 }

    // Set SVG size to match Leaflet transform
    const svgExtraPadding = 25 + this._clusterBackgroundRadius
    const dx = contentBBox.x - svgExtraPadding
    const dy = contentBBox.y - svgExtraPadding
    this._leaflet.svgOverlay
      .attr('width', contentBBox.width + 2 * svgExtraPadding)
      .attr('height', contentBBox.height + 2 * svgExtraPadding)
      .style('left', `${dx}px`)
      .style('top', `${dy}px`)

    this._leaflet.svgGroup
      .attr('transform', `translate(${-dx},${-dy})`)

    // Render content
    const nodes = this._nodesGroup.selectAll(`.${s.gNode}:not(.exit)`)
      .data(pointData, (d: Point) => d.properties.id.toString())

    nodes.exit().classed('exit', true).call(removeNodes)
    const nodesEnter = nodes.enter().append('g').attr('class', s.gNode)
      .call(createNodes)

    const nodesMerged = nodes.merge(nodesEnter)
    nodesMerged.call(updateNodes, config, this._leaflet.map)

    nodesMerged.on('click', this._onNodeClick.bind(this))

    this._clusterBackground.call(updateBackgroundNode, this._expandedCluster, config, this._leaflet.map, this._clusterBackgroundRadius)
    if (this._expandedCluster && config.clusterBackground) {
      const id = findIndex(pointData, d => d.cluster)
      pointData.forEach((d, i) => (d._sortId = i < id ? 0 : 2))
      this._nodesGroup
        .selectAll(`${s.gNode},${s.clusterBackground},${s.nodeSelectionRing}`)
        .sort((a: Point, b: Point) => a._sortId - b._sortId)
    }

    // Show selection border and hide it when the node
    // is out of visible box
    this._nodeSelectionRing.call(updateNodeSelectionRing, this._selectedNode, pointData, config, this._leaflet.map)
  }

  _zoomToExternallySelectedNode (): void {
    const pointData = this._getScreenPointData()
    const foundNode = find(pointData, d => d.properties.id === this._externallySelectedNode.properties.id)
    if (foundNode) {
      this._zoomingToExternallySelectedNode = false
      this._currentZoomLevel = null
    } else {
      const { cluster } = findNodeAndClusterInPointsById(pointData, this._externallySelectedNode.properties.id)
      const zoomLevel = this._leaflet.map.getZoom()
      // Expand cluster or fly further
      if (this._forceExpandCluster || shouldClusterExpand(cluster, zoomLevel, 8, 13)) this._expandCluster(cluster)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        const coordinates = { lng: this._externallySelectedNode.properties.longitude, lat: this._externallySelectedNode.properties.latitude }
        if (this._currentZoomLevel !== newZoomLevel) {
          this._currentZoomLevel = newZoomLevel
          this._leaflet.map.flyTo(coordinates, newZoomLevel, { duration: 0 })
        }
      }
    }
  }

  _expandCluster (cluster): void {
    const { config, config: { clusterBackground } } = this
    const padding = 1
    const points = cluster.index.getLeaves(cluster.properties.cluster_id, Infinity)

    this._forceExpandCluster = false
    if (cluster) {
      points.forEach(p => {
        p.r = getNodeRadius(p, config.pointRadius, this._leaflet.map.getZoom()) + padding
        p.cluster = cluster
      })

      packSiblings(points)
      this._resetExpandedCluster()
      this._expandedCluster = {
        cluster,
        points,
      }

      if (clusterBackground) this._clusterBackgroundRadius = getClusterRadius(this._expandedCluster)

      this.render()
    }

    this._zoomingToExternallySelectedNode = false
  }

  _resetExpandedCluster (): void {
    if (this._expandedCluster && this._expandedCluster.points) {
      this._expandedCluster.points.forEach(d => { delete d.cluster })
    }
    this._expandedCluster = null
  }

  _getScreenPointData (customBounds?): Point[] {
    const { config, datamodel: { data } } = this
    if (!data || !this._clusterIndex) return []

    let clusters = getClusterPoints(this._clusterIndex, this._leaflet.map, config.pointId, customBounds)
    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      clusters = clusters.filter(c => c.properties.cluster_id !== this._expandedCluster.cluster.properties.cluster_id)
      // Add Points from expanded cluster
      clusters = clusters.concat(this._expandedCluster.points)
    }
    const pointData = clusters
      .map((d: Point) => geoJSONPointToScreenPoint(d, this._leaflet.map, config.pointRadius, config.pointStrokeWidth, config.pointColor, config.pointShape, config.pointId))
      .sort((a, b) => getPointDisplayOrder(a, config.pointStatus, config.statusMap) - getPointDisplayOrder(b, config.pointStatus, config.statusMap))

    return pointData
  }

  _onMapDragLeaflet (): void {
    this._cancelBackgroundClick = true
  }

  _onMapMove (): void {
    const { config: { onMapMoveZoom } } = this
    this._hasBeenMoved = true
    this.render()
    onMapMoveZoom?.({
      mapCenter: this._leaflet.map.getCenter(),
      zoomLevel: this._leaflet.map.getZoom(),
    })
  }

  _onMapMoveEnd (): void {
    const { config: { renderer } } = this
    if (renderer === MapRenderer.MAPBOXGL) {
      const events = this._leaflet.layer.getEvents()
      const zoomedEvent = events.zoomend.bind(this._leaflet.layer)
      zoomedEvent()
    }
    if (!this._externallySelectedNode || !this._zoomingToExternallySelectedNode) return
    this._zoomToExternallySelectedNode()
  }

  _onMapZoom (): void {
    const { config: { onMapMoveZoom } } = this
    this._hasBeenZoomed = true
    if (!this._externallySelectedNode) this._resetExpandedCluster()
    else if (!this._zoomingToExternallySelectedNode) {
      this._externallySelectedNode = null
    }

    onMapMoveZoom?.({
      mapCenter: this._leaflet.map.getCenter(),
      zoomLevel: this._leaflet.map.getZoom(),
    })
  }

  _onBackgroundClick (d, el, event): void {
    if (this._cancelBackgroundClick) {
      this._cancelBackgroundClick = false
      return
    }

    this._selectedNode = null
    this._externallySelectedNode = null
    this._resetExpandedCluster()
    this.render()
  }

  _onNodeClick (d, i, elements): void {
    const { config: { flyToDuration } } = this

    this._externallySelectedNode = null
    event.stopPropagation()
    const zoomLevel = this._leaflet.map.getZoom()
    const coordinates = { lng: d.geometry.coordinates[0], lat: d.geometry.coordinates[1] }
    if (d.properties.cluster) {
      if (shouldClusterExpand(d, zoomLevel)) this._expandCluster(d)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        this._leaflet.map.flyTo(coordinates, newZoomLevel, { duration: flyToDuration / 1000 })
      }
    } else {
      this._selectedNode = d
      this.render()
    }
  }

  // _onMouseoverNode (d, el, event): void {

  // }

  // _onMouseoutNode (d, el, event): void {

  // }

  // _onMousemoveNode (d, el, event): void {
  // }

  _onMousedownNode (d, el, event): void {
    this._cancelBackgroundClick = true
  }

  _onMouseupNode (d, el, event): void {
    this._cancelBackgroundClick = false
  }
}
