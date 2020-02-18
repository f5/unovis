// Copyright (c) Volterra, Inc. All rights reserved.
import { select, Selection, event } from 'd3-selection'

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
import { bBoxMerge, clampZoomLevel } from './modules/utils'
import { createNodes, updateNodes, removeNodes } from './modules/node'
import { createNodeSelectionRing, updateNodeSelectionRing } from './modules/selectionRing'
import { createBackgroundNode, updateBackgroundNode } from './modules/clusterBackground'

export class Map<Datum> {
  static selectors = s
  div: Selection<HTMLElement, any, HTMLElement, any>
  element: HTMLElement
  config: MapConfig<Datum> = new MapConfig()
  datamodel: MapDataModel<Datum> = new MapDataModel()
  protected _container: HTMLElement
  private _leaflet: any
  private _cancelBackgroundClick = false
  private _hasBeenMoved = false
  private _hasBeenZoomed = false
  private _triggerBackroundClick = false
  private _externallySelectedNode = null
  private _zoomingToExternallySelectedNode = false
  private _forceExpandCluster = false
  private _nodesGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _nodeSelectionRing: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _clusterBackground: Selection<SVGGElement, object[], SVGGElement, object[]>
  private _clusterBackgroundRadius = 0
  private _selectedNode = null
  private _currentZoomLevel = null

  events = {
    [Map.selectors.node]: {
      mousemove: this._onMousemoveNode,
      mouseover: this._onMouseoverNode,
      mouseout: this._onMouseoutNode,
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
        this._onBackgroundClick(null, e.originalEvent.target, e.originalEvent)
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

    this.datamodel.leafletMap = this._leaflet.map

    if (data) this.setData(data)
  }

  setConfig (config: MapConfig<Datum>): void {
    this.config.init(config)
    this.datamodel.longitude = this.config.pointLongitude
    this.datamodel.latitude = this.config.pointLatitude
    this.datamodel.id = this.config.pointId
    this.datamodel.status = this.config.pointStatus
    this.datamodel.shape = this.config.pointShape
    this.datamodel.color = this.config.pointColor
    this.datamodel.pointRadius = this.config.pointRadius
    this.datamodel.pointStrokeWidth = this.config.pointStrokeWidth
    this.datamodel.statusStyle = this.config.statusStyle
  }

  setData (data): void {
    this.datamodel.data = data
    this.render()
  }

  render (): void {
    if (!this._leaflet) return
    this._renderData()
  }

  fitToPoints (duration = this.config.flyToDuration, padding = [40, 40]): void {
    if (!this._leaflet || !this._leaflet.map) return
    if (!this.datamodel.data.length) return
    const bounds = this.datamodel.getDataLatLngBounds()
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
    const { datamodel } = this
    datamodel.resetExpandedCluster()
    const allPoints = datamodel.getPointsInCurrentBounds()
    let foundNode = find(allPoints, (d: Point) => d.properties.id === id)
    if (!foundNode) {
      const { node } = datamodel.findNodeAndClusterInPointsById(allPoints, id)
      foundNode = node
    }
    if (foundNode) {
      this._externallySelectedNode = foundNode
      this._zoomingToExternallySelectedNode = true
      if (selectNode) this._selectedNode = foundNode
      this._forceExpandCluster = !isNil(customZoomLevel)
      const zoomLevel = isNil(customZoomLevel) ? this._leaflet.map.getZoom() : customZoomLevel
      const coordinates = { lon: foundNode.properties.longitude, lat: foundNode.properties.latitude }
      this._leaflet.map.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      console.warn(`Node with index ${id} can not be found`)
    }
  }

  getNodeRelativePosition (node): { x: number; y: number } {
    return this.datamodel.getNodeRelativePosition(node)
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
    const { datamodel, config } = this

    const pointData = datamodel.points
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
    nodesMerged.call(updateNodes, datamodel, config)

    nodesMerged.on('click', this._onNodeClick.bind(this))

    this._clusterBackground.call(updateBackgroundNode, datamodel, config, this._clusterBackgroundRadius)
    if (datamodel.expandedCluster && config.clusterBackground) {
      const id = findIndex(pointData, d => d.cluster)
      pointData.forEach((d, i) => (d._sortId = i < id ? 0 : 2))
      this._nodesGroup
        .selectAll(`${s.gNode},${s.clusterBackground},${s.nodeSelectionRing}`)
        .sort((a: Point, b: Point) => a._sortId - b._sortId)
    }

    // Show selection border and hide it when the node
    // is out of visible box
    this._nodeSelectionRing.call(updateNodeSelectionRing, datamodel, config, this._selectedNode)
  }

  _zoomToExternallySelectedNode (): void {
    const { datamodel } = this
    const foundNode = find(datamodel.points, d => d.properties.id === this._externallySelectedNode.properties.id)
    if (foundNode) {
      this._zoomingToExternallySelectedNode = false
      this._currentZoomLevel = null
    } else {
      const { cluster } = datamodel.findNodeAndClusterInPointsById(datamodel.points, this._externallySelectedNode.properties.id)
      const zoomLevel = this._leaflet.map.getZoom()
      // Expand cluster or fly further
      if (this._forceExpandCluster || datamodel.shouldClusterExpand(cluster, zoomLevel, 8, 13)) this._expandCluster(cluster)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        const coordinates = { lon: this._externallySelectedNode.properties.longitude, lat: this._externallySelectedNode.properties.latitude }
        if (this._currentZoomLevel !== newZoomLevel) {
          this._currentZoomLevel = newZoomLevel
          this._leaflet.map.flyTo(coordinates, newZoomLevel, { duration: 0 })
        }
      }
    }
  }

  _expandCluster (cluster): void {
    const { datamodel, config: { clusterBackground } } = this
    this._forceExpandCluster = false
    if (cluster) {
      datamodel.expandCluster(cluster)
      if (clusterBackground) this._clusterBackgroundRadius = datamodel.getClusterRadius()

      this.render()
    }
    this._zoomingToExternallySelectedNode = false
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
    const { datamodel, config: { onMapMoveZoom } } = this
    this._hasBeenZoomed = true
    if (!this._externallySelectedNode) datamodel.resetExpandedCluster()
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
    this.datamodel.resetExpandedCluster()
    this.render()
  }

  _onNodeClick (d, i, elements): void {
    const { datamodel, config: { flyToDuration } } = this
    this._externallySelectedNode = null
    event.stopPropagation()
    const zoomLevel = this._leaflet.map.getZoom()
    const coordinates = { lon: d.geometry.coordinates[0], lat: d.geometry.coordinates[1] }
    if (d.properties.cluster) {
      if (datamodel.shouldClusterExpand(d, zoomLevel)) this._expandCluster(d)
      else {
        const newZoomLevel = clampZoomLevel(zoomLevel)
        this._leaflet.map.flyTo(coordinates, newZoomLevel, { duration: flyToDuration / 1000 })
      }
    } else {
      this._selectedNode = d
      this.render()
    }
  }

  _onMouseoverNode (d, el, event): void {

  }

  _onMouseoutNode (d, el, event): void {

  }

  _onMousemoveNode (d, el, event): void {
  }

  _onMousedownNode (d, el, event): void {
    this._cancelBackgroundClick = true
  }

  _onMouseupNode (d, el, event): void {
    this._cancelBackgroundClick = false
  }
}
