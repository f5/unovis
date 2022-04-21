import { select, Selection } from 'd3-selection'
import { packSiblings } from 'd3-hierarchy'
import L from 'leaflet'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'
import { ResizeObserver } from '@juggle/resize-observer'
import { StyleSpecification } from 'maplibre-gl'

// Core
import { ComponentCore } from 'core/component'

// Model
import { MapDataModel } from 'data-models/map'

// Types
import { ComponentType } from 'types/component'

// Utils
import { clamp, isNil, find, getNumber, getString, isString } from 'utils/data'
import { constraintMapViewThrottled } from './renderer/mapboxgl-utils'

// Local Types
import { Bounds, LeafletMapPoint, LeafletMapPointDatum, LeafletMapRenderer, MapZoomState, PointExpandedClusterProperties } from './types'

// Config
import { LeafletMapConfig, LeafletMapConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { initialMapCenter, initialMapZoom, setupMap, updateTopoJson } from './modules/map'
import { collideLabels, createNodes, removeNodes, updateNodes } from './modules/node'
import { createNodeSelectionRing, updateNodeSelectionRing } from './modules/selectionRing'
import { createBackgroundNode, updateBackgroundNode } from './modules/clusterBackground'
import {
  bBoxMerge,
  calculateClusterIndex,
  getNextZoomLevelOnClusterClick,
  findNodeAndClusterInPointsById,
  geoJSONPointToScreenPoint,
  getClusterRadius,
  getClustersAndPoints,
  getNodeRelativePosition,
  getPointRadius,
  shouldClusterExpand,
} from './modules/utils'
import { TangramScene } from './renderer/map-style'

export class LeafletMap<Datum> extends ComponentCore<Datum[]> {
  static selectors = s
  type = ComponentType.HTML
  element: HTMLElement
  config: LeafletMapConfig<Datum> = new LeafletMapConfig()
  datamodel: MapDataModel<Datum> = new MapDataModel()
  protected _container: HTMLElement
  protected _containerSelection: Selection<HTMLElement, unknown, null, undefined>
  public _onMapMoveEndInternal: (leaflet: L.Map) => void // Internal callback needed by Leaflet Flow Map
  private _map: { leaflet: L.Map; layer: L.Layer; svgOverlay: Selection<SVGElement, any, HTMLElement, any>; svgGroup: Selection<SVGGElement, any, SVGElement, any> }
  private _clusterIndex: Supercluster<Datum>
  private _expandedCluster: { points: PointFeature<PointExpandedClusterProperties<Datum>>[]; cluster: LeafletMapPoint<Datum> } = null
  private _cancelBackgroundClick = false
  private _hasBeenMoved = false
  private _hasBeenZoomed = false
  private _isMoving = false
  private _isZooming = false
  private _eventInitiatedByComponent = false
  private _triggerBackgroundClick = false
  private _externallySelectedPoint = null
  private _zoomingToExternallySelectedPoint = false
  private _forceExpandCluster = false
  private _pointGroup: Selection<SVGGElement, Record<string, unknown>[], SVGElement, Record<string, unknown>[]>
  private _pointSelectionRing: Selection<SVGGElement, Record<string, unknown>[], SVGElement, Record<string, unknown>[]>
  private _clusterBackground: Selection<SVGGElement, Record<string, unknown>[], SVGElement, Record<string, unknown>[]>
  private _clusterBackgroundRadius = 0
  private _selectedPoint: LeafletMapPoint<Datum> = null
  private _currentZoomLevel = null
  private _firstRender = true
  private _renderDataAnimationFrame: number
  private resizeObserver: ResizeObserver
  private themeObserver: MutationObserver
  readonly _leafletInitializationPromise: Promise<L.Map>

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static DEFAULT_CONTAINER_HEIGHT = 600

  events = {
    [LeafletMap.selectors.point]: {
      mouseup: this._onPointMouseUp.bind(this),
      mousedown: this._onPointMouseDown.bind(this),
      click: this._onPointClick.bind(this),
    },
  }

  constructor (container: HTMLElement, config?: LeafletMapConfigInterface<Datum>, data?: Datum[]) {
    super(ComponentType.HTML)
    this._container = container
    this._containerSelection = select(this._container)

    this._container.appendChild(this.element)
    this.g.attr('class', s.root)

    if (config) this.setConfig(config)

    if (!this._container.clientWidth) {
      console.warn('Unovis | Leaflet Map: The width of the container is not set. Setting to 100%.')
      this._containerSelection.style('width', '100%')
    }

    if (!this._container.clientHeight) {
      console.warn(`Unovis | Leaflet Map: The height of the container is not set. Setting to ${LeafletMap.DEFAULT_CONTAINER_HEIGHT}px.`)
      this._containerSelection.style('height', `${LeafletMap.DEFAULT_CONTAINER_HEIGHT}px`)
    }

    this._leafletInitializationPromise = new Promise((resolve) => {
      setupMap(this.element, this.config).then(map => {
        if (config) this.setConfig(config)

        this._map = map
        this._map.leaflet.on('drag', this._onMapDragLeaflet.bind(this))
        this._map.leaflet.on('move', this._onMapMove.bind(this))
        this._map.leaflet.on('movestart', this._onMapMoveStart.bind(this))
        this._map.leaflet.on('moveend', this._onMapMoveEnd.bind(this))
        this._map.leaflet.on('zoom', this._onMapZoom.bind(this))
        this._map.leaflet.on('zoomstart', this._onMapZoomStart.bind(this))
        this._map.leaflet.on('zoomend', this._onMapZoomEnd.bind(this))

        // We need to handle background click in a special way to deal
        //   with d3 svg overlay that might have smaller size than the map itself
        //   (see this._onNodeMouseDown() and this this._onNodeMouseDown())
        this._map.leaflet.on('mousedown', () => {
          if (!this._cancelBackgroundClick) this._triggerBackgroundClick = true
        })

        this._map.leaflet.on('mouseup', (e) => {
          if (this._triggerBackgroundClick) {
            this._triggerBackgroundClick = false
            const originalEvent = (e as any).originalEvent
            this._onBackgroundClick(originalEvent.target, originalEvent)
          }
        })

        this._map.svgOverlay
          .attr('class', s.svgOverlay)
          .insert('rect', ':first-child')
          .attr('class', s.backgroundRect)
          .attr('width', '100%')
          .attr('height', '100%')

        this._pointGroup = this._map.svgGroup.append('g').attr('class', s.points)
        this._clusterBackground = this._pointGroup.append('g')
          .attr('class', s.clusterBackground)
          .call(createBackgroundNode)
        this._pointSelectionRing = this._pointGroup.append('g')
          .attr('class', s.pointSelectionRing)
          .call(createNodeSelectionRing)

        this._map.leaflet.setView(initialMapCenter, initialMapZoom)
        if (document.body.classList.contains('theme-dark') && config.rendererSettingsDarkTheme) {
          this.setTheme(config.rendererSettingsDarkTheme)
        }
        if (data) this.setData(data)
        this.config.onMapInitialized?.()
        resolve(this._map.leaflet)
      })
    })

    // When the container size changes we have to initiate map resize in order to update its dimensions
    this.resizeObserver = new ResizeObserver(() => {
      this._map?.leaflet?.invalidateSize()
      this.config.tooltip?.hide()
    })
    this.resizeObserver.observe(container)

    // If dark theme is enabled, update map's style when document body's class list changes
    if (this.config.rendererSettingsDarkTheme) {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach(change => {
          if (change.attributeName === 'class') {
            this.setTheme((change.target as HTMLElement).classList.contains('theme-dark')
              ? this.config.rendererSettingsDarkTheme
              : this.config.rendererSettings
            )
          }
        })
      })
      this.themeObserver.observe(document.body, { attributes: true })
    }
  }

  setConfig (config: LeafletMapConfigInterface<Datum>): void {
    this.config.init(config)

    if (config.width) this._containerSelection.style('width', isString(config.width) ? config.width : `${config.width}px`)
    if (config.height) this._containerSelection.style('height', isString(config.height) ? config.height : `${config.height}px`)

    if (this._map) {
      if (this.config.topoJSONLayer?.sources && this.config.renderer === LeafletMapRenderer.Tangram) {
        console.warn('TopoJSON layer render is not supported with Tangram renderer')
      } else {
        const layer = this._map.layer as any // Using any because the typings are not full
        const mapboxMap = layer.getMaplibreMap()
        if (mapboxMap.isStyleLoaded()) updateTopoJson(mapboxMap, this.config)
      }
    }

    if (this.config.tooltip) {
      this.config.tooltip.setContainer(this._container)
      this.config.tooltip.setComponents([this])
    }
  }

  setData (data: Datum[]): void {
    const { config, datamodel } = this

    const dataValid = data.filter(d => {
      const lat = getNumber(d, config.pointLatitude)
      const lon = getNumber(d, config.pointLongitude)
      const valid = isFinite(lat) && isFinite(lon)

      if (!valid) console.warn('Map: Invalid point coordinates', d)
      return valid
    })

    datamodel.data = dataValid

    // We use Supercluster for real-time node clustering
    this._clusterIndex = calculateClusterIndex<Datum>(data, this.config)
    this._leafletInitializationPromise.then(() => {
      this.render()
    })
  }

  setTheme (theme: TangramScene | StyleSpecification | string): void {
    const { config } = this
    const layer = this._map.layer as any // Using any because the typings are not full
    if (config.renderer === LeafletMapRenderer.Tangram) {
      layer.scene.load(theme)
    } else {
      layer.getMaplibreMap().setStyle(theme)
    }
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

    if (config.bounds) this.fitToBounds(config.bounds)

    this._firstRender = false
  }

  public getLeafletInstancePromise (): Promise<L.Map> {
    return this._leafletInitializationPromise
  }

  public fitToPoints (duration = this.config.flyToDuration, padding = this.config.fitViewPadding): void {
    const { config, datamodel, datamodel: { data } } = this

    if (!this._map || !this._map.leaflet) return
    if (!data?.length) return
    const bounds = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    this._flyToBounds(bounds, duration, padding)
  }

  public fitToBounds (bounds: Bounds, duration = this.config.flyToDuration, padding = this.config.fitViewPadding): void {
    const { northEast, southWest } = bounds
    if (isNil(northEast) || isNil(southWest)) return
    if (isNil(northEast.lat) || isNil(northEast.lng)) return
    if (isNil(southWest.lat) || isNil(southWest.lng)) return
    if (!this._map || !this._map.leaflet) return
    this._flyToBounds([
      [northEast.lat, southWest.lng],
      [southWest.lat, northEast.lng],
    ], duration, padding)
  }

  public selectPointById (id: string, centerPoint = false): void {
    const { config } = this
    const pointData = this._getPointData()
    const foundPoint = pointData.find(d => d.properties.id === id)

    if (!foundPoint) {
      console.warn(`Node with id ${id} can not be found`)
      return
    }

    if (foundPoint.properties?.cluster) {
      console.warn('Cluster can\'t be selected')
      return
    }

    this._selectedPoint = foundPoint

    const isPointInsideExpandedCluster = this._expandedCluster?.points?.find(d => getString(d.properties, config.pointId) === id)
    if (!isPointInsideExpandedCluster) this._resetExpandedCluster()

    if (centerPoint) {
      const coordinates = {
        lng: getNumber(foundPoint.properties, config.pointLongitude),
        lat: getNumber(foundPoint.properties, config.pointLatitude),
      }

      const zoomLevel = this._map.leaflet.getZoom()
      this._eventInitiatedByComponent = true
      this._map.leaflet.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      this._renderData()
    }
  }

  public getSelectedPointId (): string | number | undefined {
    return this._selectedPoint?.id
  }

  public unselectPoint (): void {
    this._selectedPoint = null
    this._externallySelectedPoint = null
    this.render()
  }

  public zoomToPointById (id: string, selectNode = false, customZoomLevel?: number): void {
    const { config, datamodel } = this
    if (!datamodel.data.length) {
      console.warn('There are no points on the map')
      return
    }
    const dataBoundsAll = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    const bounds: [number, number, number, number] = [dataBoundsAll[0][1], dataBoundsAll[1][0], dataBoundsAll[1][1], dataBoundsAll[0][0]]
    const pointDataAll = this._getPointData(bounds)

    let foundPoint = pointDataAll.find((d: LeafletMapPoint<Datum>) => d.properties.id === id)

    // If point was found and it's a cluster -> do nothing
    if (foundPoint?.properties?.cluster) {
      console.warn('Cluster can\'t be zoomed in')
      return
    }

    // If point was not found -> search for it in all collapsed clusters
    if (!foundPoint) {
      const { node } = findNodeAndClusterInPointsById(pointDataAll, id, config.pointId)
      foundPoint = node
    }

    if (foundPoint) {
      // If point was found and it's inside an expanded cluster -> simply select it
      const isPointInsideExpandedCluster = this._expandedCluster?.points?.find(d => getString(d.properties, config.pointId) === id)
      if (isPointInsideExpandedCluster && selectNode) {
        this._selectedPoint = foundPoint
        this._renderData()
        return
      }

      // Else - trigger zoom
      this._externallySelectedPoint = foundPoint
      this._zoomingToExternallySelectedPoint = true

      this._forceExpandCluster = !isNil(customZoomLevel)
      if (selectNode) this._selectedPoint = foundPoint

      const zoomLevel = isNil(customZoomLevel) ? this._map.leaflet.getZoom() : customZoomLevel
      const coordinates = {
        lng: getNumber(foundPoint.properties, config.pointLongitude),
        lat: getNumber(foundPoint.properties, config.pointLatitude),
      }
      this._eventInitiatedByComponent = true
      this._map.leaflet.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      console.warn(`Node with id ${id} can not be found`)
    }
  }

  public getNodeRelativePosition (node: LeafletMapPoint<Datum>): { x: number; y: number } {
    return getNodeRelativePosition(node, this._map.leaflet)
  }

  public hasBeenZoomed (): boolean {
    return this._hasBeenZoomed
  }

  public hasBeenMoved (): boolean {
    return this._hasBeenMoved
  }

  public isZooming (): boolean {
    return this._isZooming
  }

  public isMoving (): boolean {
    return this._isMoving
  }

  private _flyToBounds (bounds: [[number, number], [number, number]], durationMs: number, paddingPx?: [number, number]): void {
    this._eventInitiatedByComponent = true
    const duration = durationMs / 1000
    const padding: [number, number] | undefined = paddingPx ? [
      paddingPx[0] < this._container.clientWidth / 2 ? paddingPx[0] : this._container.clientWidth / 2,
      paddingPx[1] < this._container.clientHeight / 2 ? paddingPx[1] : this._container.clientHeight / 2,
    ] : undefined
    if (duration) {
      this._map.leaflet.flyToBounds(bounds, { duration, padding })
    } else {
      this._map.leaflet.fitBounds(bounds, { padding })
    }
  }

  private _renderData (mapMoveZoomUpdateOnly = false): void {
    const { config } = this

    const pointData = this._getPointData()
    const contentBBox = pointData.length ? bBoxMerge(pointData.map(d => d.bbox)) : { x: 0, y: 0, width: 0, height: 0 }

    // Set SVG size to match Leaflet transform
    const svgExtraPadding = 40 + this._clusterBackgroundRadius // We need it to fit point labels and expanded cluster background circle
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
    const points = this._pointGroup.selectAll(`.${s.point}:not(.exit)`)
      .data(pointData, (d: LeafletMapPoint<Datum>) => d.id.toString())

    points.exit().classed('exit', true).call(removeNodes)
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .call(createNodes)

    const pointsMerged = points.merge(pointsEnter)
    pointsEnter.call(updateNodes, config, this._map.leaflet)
    points.call(updateNodes, config, this._map.leaflet, mapMoveZoomUpdateOnly)
    pointsMerged.call(collideLabels, this._map.leaflet)

    this._clusterBackground.call(updateBackgroundNode, this._expandedCluster, config, this._map.leaflet, this._clusterBackgroundRadius)
    if (this._expandedCluster && config.clusterBackground) {
      pointData.forEach((d, i) => { d._zIndex = d.properties?.expandedClusterPoint ? 2 : 0 })
      this._pointGroup
        .selectAll(`.${s.point}, .${s.clusterBackground}, .${s.pointSelectionRing}`)
        .sort((a: LeafletMapPoint<Datum>, b: LeafletMapPoint<Datum>) => a._zIndex - b._zIndex)
    }

    // Show selection border and hide it when the node
    // is out of visible box
    this._pointSelectionRing.call(updateNodeSelectionRing, this._selectedPoint, pointData, config, this._map.leaflet)

    // Set up events
    // this.setUpEvents()
    this._setUpComponentEventsThrottled()

    // Tooltip
    config.tooltip?.update()
  }

  private _zoomToExternallySelectedPoint (): void {
    const { config } = this
    if (!this._externallySelectedPoint) return

    const pointData = this._getPointData()
    const foundNode = find(pointData, d => d.properties.id === this._externallySelectedPoint.properties.id)
    if (foundNode) {
      this._zoomingToExternallySelectedPoint = false
      this._currentZoomLevel = null
    } else {
      const { cluster } = findNodeAndClusterInPointsById(pointData, this._externallySelectedPoint.properties.id, config.pointId)
      if (!cluster) return

      const zoomLevel = this._map.leaflet.getZoom()
      // Expand cluster or fly further
      if (this._forceExpandCluster || shouldClusterExpand(cluster, zoomLevel, 8, 13)) {
        this._expandCluster(cluster)
      } else {
        const newZoomLevel = getNextZoomLevelOnClusterClick(zoomLevel)
        const coordinates = { lng: this._externallySelectedPoint.properties.longitude, lat: this._externallySelectedPoint.properties.latitude }
        if (this._currentZoomLevel !== newZoomLevel) {
          this._currentZoomLevel = newZoomLevel
          this._eventInitiatedByComponent = true
          this._map.leaflet.flyTo(coordinates, newZoomLevel, { duration: 0 })
        }
      }
    }
  }

  private _expandCluster (clusterPoint: LeafletMapPoint<Datum>): void {
    const { config, config: { clusterBackground } } = this
    const padding = 1

    config.tooltip?.hide()

    this._forceExpandCluster = false
    if (clusterPoint) {
      const points: PointFeature<PointExpandedClusterProperties<Datum>>[] =
        clusterPoint.clusterIndex.getLeaves(clusterPoint.properties.cluster_id as number, Infinity)
      const packPoints: {x: number; y: number; r: number }[] = points.map(p => ({
        x: null,
        y: null,
        r: getPointRadius(p, config.pointRadius, this._map.leaflet.getZoom()) + padding,
      }))
      packSiblings(packPoints)

      points.forEach((p, i) => {
        p.properties.expandedClusterPoint = clusterPoint
        p.properties.r = packPoints[i].r
        p.properties.dx = packPoints[i].x
        p.properties.dy = packPoints[i].y
      })

      this._resetExpandedCluster()
      this._expandedCluster = {
        cluster: clusterPoint,
        points,
      }

      if (clusterBackground) this._clusterBackgroundRadius = getClusterRadius(this._expandedCluster)

      this._renderData()
    }

    this._zoomingToExternallySelectedPoint = false
  }

  private _resetExpandedCluster (): void {
    this._expandedCluster?.points?.forEach(d => { delete d.properties.expandedClusterPoint })
    this._expandedCluster = null
  }

  private _getPointData (customBounds?: [number, number, number, number]): LeafletMapPoint<Datum>[] {
    const { config, datamodel: { data } } = this
    const { pointRadius, pointColor, pointShape, pointId, valuesMap } = config

    if (!data || !this._clusterIndex) return []

    let geoJSONPoints: (ClusterFeature<Datum> | PointFeature<PointExpandedClusterProperties<Datum>>)[] =
      getClustersAndPoints<Datum>(this._clusterIndex, this._map.leaflet, customBounds)

    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      geoJSONPoints = geoJSONPoints.filter(c => (c as ClusterFeature<Datum>).properties.cluster_id !== this._expandedCluster.cluster.properties.cluster_id)
      // Add points from the expanded cluster
      geoJSONPoints = geoJSONPoints.concat(this._expandedCluster.points)
    }

    const pointData = geoJSONPoints
      // Todo: Remove explicitly set ClusterFeature<LeafletMapPointDatum<Datum>> type
      .map((d: ClusterFeature<LeafletMapPointDatum<Datum>>) => geoJSONPointToScreenPoint(d, this._map.leaflet, pointRadius, pointColor, pointShape, pointId, valuesMap))
      // .sort((a, b) => getPointDisplayOrder(a, config.pointStatus, config.valuesMap) - getPointDisplayOrder(b, config.pointStatus, config.valuesMap))

    return pointData
  }

  private _getMapZoomState (): MapZoomState {
    const leafletBounds = this._map.leaflet.getBounds()
    const southWest = leafletBounds.getSouthWest()
    const northEast = leafletBounds.getNorthEast()

    return {
      mapCenter: this._map.leaflet.getCenter(),
      zoomLevel: this._map.leaflet.getZoom(),
      bounds: { southWest, northEast },
      userDriven: !this._eventInitiatedByComponent,
    }
  }

  private _onMapDragLeaflet (): void {
    this._cancelBackgroundClick = true
  }

  private _onMapMove (): void {
    const { config } = this
    if (!this._map) return
    this._hasBeenMoved = true
    this._renderDataAnimationFrame = requestAnimationFrame(() => {
      this._renderData(true)
    })
    config.onMapMoveZoom?.(this._getMapZoomState())
  }

  private _onMapMoveStart (): void {
    const { config } = this
    if (!this._map) return
    this._isMoving = true
    config.onMapMoveStart?.(this._getMapZoomState())
  }

  private _onMapMoveEnd (): void {
    const { config } = this
    if (!this._map) return
    this._onMapMoveEndInternal?.(this._map.leaflet)
    config.onMapMoveEnd?.(this._getMapZoomState())

    if (config.renderer === LeafletMapRenderer.MapLibreGL) {
      constraintMapViewThrottled(this._map.leaflet)

      const events = this._map.layer.getEvents()
      const zoomEndEvent = events.zoomend.bind(this._map.layer)
      zoomEndEvent()
    }

    if (this._externallySelectedPoint || this._zoomingToExternallySelectedPoint) {
      this._zoomToExternallySelectedPoint()
    }

    this._isMoving = false
    this._eventInitiatedByComponent = false
  }

  private _onMapZoomStart (): void {
    const { config } = this
    if (!this._map) return
    this._isZooming = true
    config.onMapZoomStart?.(this._getMapZoomState())
  }

  private _onMapZoomEnd (): void {
    const { config } = this
    if (!this._map) return
    config.onMapZoomEnd?.(this._getMapZoomState())
    this._isZooming = false
    if (!this._isMoving) this._eventInitiatedByComponent = false
  }

  private _onMapZoom (): void {
    const { config } = this
    if (!this._map) return
    this._hasBeenZoomed = true

    if (!this._externallySelectedPoint) this._resetExpandedCluster()
    else if (!this._zoomingToExternallySelectedPoint) {
      this._externallySelectedPoint = null
    }

    config.tooltip?.hide()
    config.onMapMoveZoom?.(this._getMapZoomState())
  }

  private _onBackgroundClick (el: HTMLElement, event: MouseEvent): void {
    const { config } = this

    if (this._cancelBackgroundClick) {
      this._cancelBackgroundClick = false
      return
    }

    this._externallySelectedPoint = null
    this._resetExpandedCluster()
    this._renderData()
    config.onMapClick?.(this._getMapZoomState())
  }

  private _onPointClick (d: LeafletMapPoint<Datum>, event: MouseEvent): void {
    const { config: { flyToDuration, clusterExpandOnClick } } = this
    this._externallySelectedPoint = null
    event.stopPropagation()

    if (d.properties.cluster) {
      const zoomLevel = this._map.leaflet.getZoom()
      const coordinates = { lng: d.geometry.coordinates[0], lat: d.geometry.coordinates[1] }

      if (clusterExpandOnClick && shouldClusterExpand(d, zoomLevel)) this._expandCluster(d)
      else {
        const newZoomLevel = getNextZoomLevelOnClusterClick(zoomLevel)
        this._eventInitiatedByComponent = true
        this._map.leaflet.flyTo(coordinates, newZoomLevel, { duration: flyToDuration / 1000 })
      }
    }
  }

  private _onPointMouseDown (d: LeafletMapPoint<Datum>, event: MouseEvent): void {
    this._cancelBackgroundClick = true
  }

  private _onPointMouseUp (d: LeafletMapPoint<Datum>, event: MouseEvent): void {
    this._cancelBackgroundClick = false
  }

  public zoomIn (increment = 1): void {
    if (!this._map?.leaflet) return
    this.setZoom(this._map.leaflet.getZoom() + increment)
  }

  public zoomOut (increment = 1): void {
    if (!this._map?.leaflet) return
    this.setZoom(this._map.leaflet.getZoom() - increment)
  }

  public setZoom (zoomLevel: number): void {
    const leaflet = this._map?.leaflet
    if (!leaflet) return

    this._eventInitiatedByComponent = true
    leaflet.flyTo(
      leaflet.getCenter(),
      clamp(zoomLevel, leaflet.getMinZoom(), leaflet.getMaxZoom()),
      { duration: this.config.zoomDuration / 1000 }
    )
  }

  public fitView (): void {
    this.fitToPoints()
  }

  public destroy (): void {
    constraintMapViewThrottled.cancel()
    cancelAnimationFrame(this._renderDataAnimationFrame)
    const map = this._map?.leaflet
    this._map = undefined

    map?.stop()
    map?.remove()
    this.g.remove()
    this.resizeObserver.disconnect()
    this.themeObserver?.disconnect()
  }
}
