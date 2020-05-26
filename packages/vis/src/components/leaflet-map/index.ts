// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, event } from 'd3-selection'
import { packSiblings } from 'd3-hierarchy'
import L from 'leaflet'
import Supercluster, { PointFeature } from 'supercluster'

// Core
import { ComponentCore } from 'core/component'

// Model
import { MapDataModel } from 'data-models/map'

// Types
import { ComponentType } from 'types/component'
import { LeafletMapRenderer, Point, Bounds } from 'types/map'

// Utils
import { isNil, findIndex, find } from 'utils/data'

// Config
import { LeafletMapConfig, LeafletMapConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { setupMap, updateTopoJson, initialMapCenter, initialMapZoom } from './modules/map'
import { createNodes, updateNodes, removeNodes } from './modules/node'
import { createNodeSelectionRing, updateNodeSelectionRing } from './modules/selectionRing'
import { createBackgroundNode, updateBackgroundNode } from './modules/clusterBackground'
import {
  bBoxMerge, clampZoomLevel, getNodeRadius, getPointDisplayOrder, calulateClusterIndex, geoJSONPointToScreenPoint,
  shouldClusterExpand, findNodeAndClusterInPointsById, getNodeRelativePosition, getClusterRadius, getClustersAndPoints,
} from './modules/utils'

export class LeafletMap<Datum> extends ComponentCore<Datum[]> {
  static selectors = s
  type = ComponentType.HTML
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  config: LeafletMapConfig<Datum> = new LeafletMapConfig()
  datamodel: MapDataModel<Datum> = new MapDataModel()
  protected _container: HTMLElement
  private _map: { leaflet: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> }
  private _clusterIndex: Supercluster
  private _expandedCluster: { points: PointFeature<any>[]; cluster: Point } = null
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
  private _selectedNode: Point = null
  private _currentZoomLevel = null
  private _firstRender = true

  events = {
    [LeafletMap.selectors.gNode]: {
      mouseup: this._onNodeMouseUp.bind(this),
      mousedown: this._onNodeMouseDown.bind(this),
      click: this._onNodeClick.bind(this),
    },
  }

  constructor (container: HTMLElement, config?: LeafletMapConfigInterface<Datum>, data?: Datum[]) {
    super(ComponentType.HTML)
    this._container = container
    this._container.appendChild(this.element)
    this.g.attr('class', s.mapContainer)

    if (config) this.setConfig(config)

    this._map = setupMap(this.element, this.config)
    this._map.leaflet.on('drag', this._onMapDragLeaflet.bind(this))
    this._map.leaflet.on('move', this._onMapMove.bind(this))
    this._map.leaflet.on('moveend', this._onMapMoveEnd.bind(this))
    this._map.leaflet.on('zoom', this._onMapZoom.bind(this))

    // We need to handle background click in a special way to deal
    //   with d3 svg overlay that might have smaller size than the map itself
    //   (see this._onNodeMouseDown() and this this._onNodeMouseDown())
    this._map.leaflet.on('mousedown', () => {
      if (!this._cancelBackgroundClick) this._triggerBackroundClick = true
    })

    this._map.leaflet.on('mouseup', (e) => {
      if (this._triggerBackroundClick) {
        this._triggerBackroundClick = false
        const originalEvent = (e as any).originalEvent
        this._onBackgroundClick(null, originalEvent.target, originalEvent)
      }
    })

    this._map.svgOverlay
      .attr('class', s.svgOverlay)
      .insert('rect', ':first-child')
      .attr('class', s.backgroundRect)
      .attr('width', '100%')
      .attr('height', '100%')

    this._nodesGroup = this._map.svgGroup.append('g').attr('class', s.nodes)
    this._nodeSelectionRing = this._nodesGroup.append('g')
      .attr('class', s.nodeSelectionRing)
      .call(createNodeSelectionRing)
    this._clusterBackground = this._nodesGroup.append('g')
      .attr('class', s.clusterBackground)
      .call(createBackgroundNode)

    this._map.leaflet.setView(initialMapCenter, initialMapZoom)
    if (data) this.setData(data)
  }

  setConfig (config: LeafletMapConfigInterface<Datum>): void {
    this.config.init(config)
    if (this._map) {
      if (this.config.topoJSONLayer?.sources && this.config.renderer === LeafletMapRenderer.TANGRAM) {
        console.warn('TopoJSON layer render does not supported with Tangram renderer')
      } else {
        const mapboxmap = (this._map.layer as any).getMapboxMap()
        if (mapboxmap.isStyleLoaded()) updateTopoJson(mapboxmap, this.config)
      }
    }

    if (this.config.tooltip) {
      this.config.tooltip.setContainer(this._container)
      this.config.tooltip.setComponents([this])
    }
  }

  setData (data): void {
    this.datamodel.data = data

    // We use Supercluster for real-time node clustering
    this._clusterIndex = calulateClusterIndex<Datum>(data, this.config)
    this.render()
  }

  // We redefine the ComponentCore render function to bind event to newly created elements in this._renderData(),
  // which is being called after almost every map interaction
  render (): void {
    const { config } = this
    if (!this._map) return

    this._renderData()
    if (this._firstRender) {
      if (config.initialBounds && !config.bounds) this.fitToBounds(config.initialBounds)
    }

    if (config.selectedNodeId) this.zoomToNodeById(config.selectedNodeId, true)
    else if (config.bounds) this.fitToBounds(config.bounds)

    this._firstRender = false
    if (config.tooltip) config.tooltip.update()
  }

  fitToPoints (duration = this.config.flyToDuration, padding = [40, 40]): void {
    const { config, datamodel, datamodel: { data } } = this

    if (!this._map || !this._map.leaflet) return
    if (!data.length) return
    const bounds = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    this._flyToBounds(bounds, duration, padding)
  }

  fitToBounds (bounds: Bounds, duration = this.config.flyToDuration): void {
    const { northEast, southWest } = bounds
    if (isNil(northEast) || isNil(southWest)) return
    if (isNil(northEast.lat) || isNil(northEast.lng)) return
    if (isNil(southWest.lat) || isNil(southWest.lng)) return
    if (!this._map || !this._map.leaflet) return
    this._flyToBounds([
      [northEast.lat, southWest.lng],
      [southWest.lat, northEast.lng],
    ], duration)
  }

  zoomToNodeById (id: string, selectNode = false, customZoomLevel?: number): void {
    const { config, datamodel } = this
    this._resetExpandedCluster()

    const dataBoundsAll = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    const bounds = [dataBoundsAll[0][1], dataBoundsAll[1][0], dataBoundsAll[1][1], dataBoundsAll[0][0]]
    const pointDataAll = this._getPointData(bounds)

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
      const zoomLevel = isNil(customZoomLevel) ? this._map.leaflet.getZoom() : customZoomLevel
      const coordinates = { lng: foundNode.properties.longitude, lat: foundNode.properties.latitude }
      this._map.leaflet.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      console.warn(`Node with index ${id} can not be found`)
    }
  }

  getNodeRelativePosition (node): { x: number; y: number } {
    return getNodeRelativePosition(node, this._map.leaflet)
  }

  get hasBeenZoomed (): boolean {
    return this._hasBeenZoomed
  }

  get hasBeenMoved (): boolean {
    return this._hasBeenMoved
  }

  _flyToBounds (bounds, duration, padding?): void {
    if (duration) {
      this._map.leaflet.flyToBounds(bounds, {
        duration: duration / 1000,
        padding,
      })
    } else {
      this._map.leaflet.fitBounds(bounds, { padding })
    }
  }

  _renderData (): void {
    const { config } = this

    const pointData = this._getPointData()
    const contentBBox = pointData.length ? bBoxMerge(pointData.map(d => d.bbox)) : { x: 0, y: 0, width: 0, height: 0 }

    // Set SVG size to match Leaflet transform
    const svgExtraPadding = 25 + this._clusterBackgroundRadius
    const dx = contentBBox.x - svgExtraPadding
    const dy = contentBBox.y - svgExtraPadding
    this._map.svgOverlay
      .attr('width', contentBBox.width + 2 * svgExtraPadding)
      .attr('height', contentBBox.height + 2 * svgExtraPadding)
      .style('left', `${dx}px`)
      .style('top', `${dy}px`)

    this._map.svgGroup
      .attr('transform', `translate(${-dx},${-dy})`)

    // Render content
    const nodes = this._nodesGroup.selectAll(`.${s.gNode}:not(.exit)`)
      .data(pointData, (d: Point) => d.id.toString())

    nodes.exit().classed('exit', true).call(removeNodes)
    const nodesEnter = nodes.enter().append('g').attr('class', s.gNode)
      .call(createNodes)

    const nodesMerged = nodes.merge(nodesEnter)
    nodesMerged.call(updateNodes, config, this._map.leaflet)

    this._clusterBackground.call(updateBackgroundNode, this._expandedCluster, config, this._map.leaflet, this._clusterBackgroundRadius)
    if (this._expandedCluster && config.clusterBackground) {
      const id = findIndex(pointData, d => d.cluster)
      pointData.forEach((d, i) => { d._sortId = i < id ? 0 : 2 })
      this._nodesGroup
        .selectAll(`.${s.gNode}, .${s.clusterBackground}, .${s.nodeSelectionRing}`)
        .sort((a: Point, b: Point) => a._sortId - b._sortId)
    }

    // Show selection border and hide it when the node
    // is out of visible box
    this._nodeSelectionRing.call(updateNodeSelectionRing, this._selectedNode, pointData, config, this._map.leaflet)

    // Set up default events
    this._setUpEvents(this.events)

    // Set up user-defined events
    this._setUpEvents(this.config.events)
  }

  _zoomToExternallySelectedNode (): void {
    const pointData = this._getPointData()
    const foundNode = find(pointData, d => d.properties.id === this._externallySelectedNode.properties.id)
    if (foundNode) {
      this._zoomingToExternallySelectedNode = false
      this._currentZoomLevel = null
    } else {
      const { cluster } = findNodeAndClusterInPointsById(pointData, this._externallySelectedNode.properties.id)
      const zoomLevel = this._map.leaflet.getZoom()
      // Expand cluster or fly further
      if (this._forceExpandCluster || shouldClusterExpand(cluster, zoomLevel, 8, 13)) this._expandCluster(cluster)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        const coordinates = { lng: this._externallySelectedNode.properties.longitude, lat: this._externallySelectedNode.properties.latitude }
        if (this._currentZoomLevel !== newZoomLevel) {
          this._currentZoomLevel = newZoomLevel
          this._map.leaflet.flyTo(coordinates, newZoomLevel, { duration: 0 })
        }
      }
    }
  }

  _expandCluster (clusterPoint): void {
    const { config, config: { clusterBackground } } = this
    const padding = 1

    this._forceExpandCluster = false
    if (clusterPoint) {
      const points: PointFeature<any>[] = clusterPoint.index.getLeaves(clusterPoint.properties.cluster_id, Infinity)
      const packPoints = points.map(p => ({ x: null, y: null, r: getNodeRadius(p, config.pointRadius, this._map.leaflet.getZoom()) + padding }))
      packSiblings(packPoints)

      points.forEach((p, i) => {
        p.properties.expandedClusterPoint = clusterPoint
        p.properties.r = packPoints[i].r
        p.properties.x = packPoints[i].x
        p.properties.y = packPoints[i].y
      })

      this._resetExpandedCluster()
      this._expandedCluster = {
        cluster: clusterPoint,
        points,
      }

      if (clusterBackground) this._clusterBackgroundRadius = getClusterRadius(this._expandedCluster)

      this._renderData()
    }

    this._zoomingToExternallySelectedNode = false
  }

  _resetExpandedCluster (): void {
    this._expandedCluster?.points?.forEach(d => { delete d.properties.expandedClusterPoint })
    this._expandedCluster = null
  }

  _getPointData (customBounds?): Point[] {
    const { config, datamodel: { data } } = this
    if (!data || !this._clusterIndex) return []

    let geoJSONPoints = getClustersAndPoints<Datum>(this._clusterIndex, this._map.leaflet, customBounds)

    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      geoJSONPoints = geoJSONPoints.filter(c => c.properties.cluster_id !== this._expandedCluster.cluster.properties.cluster_id)
      // Add points from the expanded cluster
      geoJSONPoints = geoJSONPoints.concat(this._expandedCluster.points)
    }

    const pointData = geoJSONPoints
      .map((d: PointFeature<any>) => geoJSONPointToScreenPoint(d, this._map.leaflet, config.pointRadius, config.pointStrokeWidth, config.pointColor, config.pointShape, config.pointId))
      .sort((a, b) => getPointDisplayOrder(a, config.pointStatus, config.statusMap) - getPointDisplayOrder(b, config.pointStatus, config.statusMap))

    return pointData
  }

  _onMapDragLeaflet (): void {
    this._cancelBackgroundClick = true
  }

  _onMapMove (): void {
    const { config: { onMapMoveZoom } } = this
    this._hasBeenMoved = true
    this._renderData()

    const leafletBounds = this._map.leaflet.getBounds()
    const southWest = leafletBounds.getSouthWest()
    const northEast = leafletBounds.getNorthEast()
    onMapMoveZoom?.({
      mapCenter: this._map.leaflet.getCenter(),
      zoomLevel: this._map.leaflet.getZoom(),
      bounds: { southWest, northEast },
    })
  }

  _onMapMoveEnd (): void {
    const { config: { renderer } } = this
    if (renderer === LeafletMapRenderer.MAPBOXGL) {
      const events = this._map.layer.getEvents()
      const zoomedEvent = events.zoomend.bind(this._map.layer)
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

    const leafletBounds = this._map.leaflet.getBounds()
    const southWest = leafletBounds.getSouthWest()
    const northEast = leafletBounds.getNorthEast()
    onMapMoveZoom?.({
      mapCenter: this._map.leaflet.getCenter(),
      zoomLevel: this._map.leaflet.getZoom(),
      bounds: { southWest, northEast },
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
    this._renderData()
  }

  _onNodeClick (d, i, elements): void {
    const { config: { flyToDuration } } = this

    this._externallySelectedNode = null
    event.stopPropagation()
    const zoomLevel = this._map.leaflet.getZoom()
    const coordinates = { lng: d.geometry.coordinates[0], lat: d.geometry.coordinates[1] }
    if (d.properties.cluster) {
      if (shouldClusterExpand(d, zoomLevel)) this._expandCluster(d)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        this._map.leaflet.flyTo(coordinates, newZoomLevel, { duration: flyToDuration / 1000 })
      }
    } else {
      this._selectedNode = d
      this._renderData()
    }
  }

  _onNodeMouseDown (d, el, event): void {
    this._cancelBackgroundClick = true
  }

  _onNodeMouseUp (d, el, event): void {
    this._cancelBackgroundClick = false
  }
}
