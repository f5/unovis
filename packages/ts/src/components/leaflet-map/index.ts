import { select, Selection } from 'd3-selection'
import { packSiblings } from 'd3-hierarchy'
import type L from 'leaflet'
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster'
import { StyleSpecification } from 'maplibre-gl'

// Core
import { ComponentCore } from 'core/component'

// Model
import { MapDataModel } from 'data-models/map'

// Types
import { ComponentType } from 'types/component'
import { GenericDataRecord } from 'types/data'

// Utils
import { ResizeObserver } from 'utils/resize-observer'
import { clamp, isNil, getNumber, getString, isString } from 'utils/data'
import { constraintMapViewThrottled } from './renderer/mapboxgl-utils'
import {
  projectPoint,
  bBoxMerge,
  calculateClusterIndex,
  getNextZoomLevelOnClusterClick,
  findPointAndClusterByPointId,
  geoJsonPointToScreenPoint,
  getClusterRadius,
  getClustersAndPoints,
  getNodeRelativePosition,
  getPointRadius,
  shouldClusterExpand,
} from './modules/utils'

// Local Types
import {
  Bounds,
  LeafletMapClusterDatum,
  LeafletMapPoint,
  LeafletMapPointDatum,
  LeafletMapRenderer,
  LeafletMapExpandedCluster,
  MapZoomState,
  PointExpandedClusterProperties,
} from './types'

// Config
import { LeafletMapDefaultConfig, LeafletMapConfigInterface } from './config'

// Styles
import * as s from './style'

// Modules
import { initialMapCenter, initialMapZoom, setupMap, updateTopoJson } from './modules/map'
import { collideLabels, createNodes, removeNodes, updateNodes } from './modules/node'
import { createNodeSelectionRing, updateNodeSelectionRing } from './modules/selectionRing'
import { createBackgroundNode, updateBackgroundNode } from './modules/clusterBackground'

export class LeafletMap<Datum extends GenericDataRecord> extends ComponentCore<Datum[], LeafletMapConfigInterface<Datum>> {
  static selectors = s
  static cssVariables = s.variables
  protected _defaultConfig = LeafletMapDefaultConfig as LeafletMapConfigInterface<Datum>
  public config: LeafletMapConfigInterface<Datum> = this._defaultConfig

  g: Selection<HTMLElement, unknown, null, undefined>
  type = ComponentType.HTML
  element: HTMLElement
  datamodel: MapDataModel<Datum> = new MapDataModel()
  protected _container: HTMLElement
  protected _containerSelection: Selection<HTMLElement, unknown, null, undefined>
  public _onMapMoveEndInternal: (leaflet: L.Map) => void // Internal callback needed by Leaflet Flow Map
  private _map: {
    leaflet: L.Map;
    layer: L.Layer;
    svgOverlay: Selection<SVGSVGElement, unknown, null, undefined>;
    svgGroup: Selection<SVGGElement, unknown, SVGElement, undefined>;
  }

  private _clusterIndex: Supercluster<Datum>
  private _expandedCluster: LeafletMapExpandedCluster<Datum> = null
  private _cancelBackgroundClick = false
  private _hasBeenMoved = false
  private _hasBeenZoomed = false
  private _isMoving = false
  private _isZooming = false
  private _eventInitiatedByComponent = false
  private _triggerBackgroundClick = false
  private _externallySelectedPoint: LeafletMapPoint<Datum> | PointFeature<Datum> | null = null
  private _zoomingToExternallySelectedPoint = false
  private _forceExpandCluster = false
  private _pointGroup: Selection<SVGGElement, unknown, SVGElement, undefined>
  private _pointSelectionRing: Selection<SVGGElement, unknown, SVGElement, undefined>
  private _clusterBackground: Selection<SVGGElement, unknown, SVGElement, undefined>
  private _clusterBackgroundRadius = 0
  private _selectedPoint: LeafletMapPoint<Datum> = null
  private _currentZoomLevel: number | null = null
  private _firstRender = true
  private _isDarkThemeActive = false
  private resizeObserver: ResizeObserver
  private themeObserver: MutationObserver
  private _renderDataAnimationFrameId: number | null = null
  private _flyToBoundsAnimationFrameId: number | null = null
  readonly _leafletInitializationPromise: Promise<L.Map>

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static DEFAULT_CONTAINER_HEIGHT = 600

  protected events = {
    [LeafletMap.selectors.point]: {
      mouseup: this._onPointMouseUp.bind(this),
      mousedown: this._onPointMouseDown.bind(this),
      click: this._onPointClick.bind(this),
    },
  }

  constructor (container: HTMLElement, config?: LeafletMapConfigInterface<Datum>, data?: Datum[]) {
    super(ComponentType.HTML)
    this._container = container
    this._containerSelection = select(this._container).attr('role', 'figure')

    this._container.appendChild(this.element)
    this.g
      .attr('class', s.root)
      .attr('aria-hidden', true)

    if (config) this.setConfig(config)

    if (!this._container.clientWidth) {
      console.warn('Unovis | Leaflet Map: The width of the container is not set. Setting to 100%.')
      this._containerSelection.style('width', '100%')
    }

    if (!this._container.clientHeight) {
      console.warn(`Unovis | Leaflet Map: The height of the container is not set. Setting to ${LeafletMap.DEFAULT_CONTAINER_HEIGHT}px.`)
      this._containerSelection.style('height', `${LeafletMap.DEFAULT_CONTAINER_HEIGHT}px`)
    }

    // Initialize map asynchronously
    this._leafletInitializationPromise = new Promise((resolve) => {
      setupMap(this.element, this.config).then(map => {
        // Apply the `s.map` class to `tilePane` to allow tooltip interactions
        select(map.leaflet.getPanes().tilePane).classed(s.map, true)
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

        if (['theme-dark', 'dark-theme'].some(className => [document.body, document.documentElement].some(element => element.classList.contains(className))) && config.styleDarkTheme) {
          this._isDarkThemeActive = true
          this.setTheme(config.styleDarkTheme)
        }

        this.config.onMapInitialized?.()
        resolve(this._map.leaflet)
      })
    })


    // Set data and render the map when it's ready
    this.setData(data ?? [])

    // When the container size changes we have to initiate map resize in order to update its dimensions
    this.resizeObserver = new ResizeObserver(() => {
      this._map?.leaflet?.invalidateSize()
      this.config.tooltip?.hide()
    })
    this.resizeObserver.observe(container)

    // If dark theme is enabled, update map's style when document body's class list changes
    if (this.config.styleDarkTheme) {
      this.themeObserver = new MutationObserver((mutations) => {
        mutations.forEach(change => {
          if (change.attributeName === 'class') {
            const isDarkTheme = ['theme-dark', 'dark-theme'].some(className => (change.target as HTMLElement).classList.contains(className))
            if (this._isDarkThemeActive !== isDarkTheme) {
              this.setTheme(isDarkTheme ? this.config.styleDarkTheme : this.config.style)
              this._isDarkThemeActive = isDarkTheme
            }
          }
        })
      })
      this.themeObserver.observe(document.body, { attributes: true })
      this.themeObserver.observe(document.documentElement, { attributes: true })
    }
  }

  setConfig (config: LeafletMapConfigInterface<Datum>): void {
    super.setConfig(config)

    if (config.width) this._containerSelection.style('width', isString(config.width) ? config.width : `${config.width}px`)
    if (config.height) this._containerSelection.style('height', isString(config.height) ? config.height : `${config.height}px`)

    if (this._map && config.renderer === LeafletMapRenderer.MapLibre) {
      const layer = this._map.layer as any // Using any because the typings are not full
      const maplibreMap = layer.getMaplibreMap()
      if (maplibreMap.isStyleLoaded()) updateTopoJson(maplibreMap, this.config)
    }

    if (this.config.tooltip) {
      this.config.tooltip.setContainer(this._container)
      this.config.tooltip.setComponents([this])
      this.config.tooltip.update()
    }

    // Apply the `aria-label` attribute
    this._containerSelection.attr('aria-label', config.ariaLabel)
  }

  setData (data: Datum[]): void {
    const { config, datamodel } = this

    const dataValid = data.filter(d => {
      const lat = getNumber(d, config.pointLatitude)
      const lon = getNumber(d, config.pointLongitude)
      const valid = isFinite(lat) && isFinite(lon)

      if (!valid) console.warn('Unovis | Leaflet Map: Invalid point coordinates', d)
      return valid
    })

    datamodel.data = dataValid

    // We use Supercluster for real-time node clustering
    this._clusterIndex = calculateClusterIndex<Datum>(dataValid, this.config)

    // If there was an expanded cluster, try to find its successor and expand it too
    if (this._expandedCluster && this._map.leaflet) {
      // Reset expanded cluster before calling `_getPointData()` to get data with all clusters collapsed
      const expandedCluster = this._expandedCluster
      this._resetExpandedCluster()
      const pointData = this._getPointData()

      const expandedClusterCenterPx = projectPoint(expandedCluster.cluster, this._map.leaflet)
      const expandedClusterRadiusPx = expandedCluster.cluster.radius
      const cluster = pointData.find((c) => {
        if (!c.isCluster) return false
        const pos = projectPoint(c, this._map.leaflet)
        const r = c.radius
        const distance = Math.sqrt((expandedClusterCenterPx.x - pos.x) ** 2 + (expandedClusterCenterPx.y - pos.y) ** 2)
        return distance < (expandedClusterRadiusPx + r)
      })

      if (cluster) this._expandCluster(cluster, true)
    }

    // Render
    this._leafletInitializationPromise.then(() => {
      this.render()
    })
  }

  setTheme (theme: StyleSpecification | string): void {
    const layer = this._map.layer as any // Using any because the typings are not full
    if (this.config.renderer === LeafletMapRenderer.MapLibre) {
      const maplibreMap = layer.getMaplibreMap()
      maplibreMap.setStyle?.(theme)
      updateTopoJson(maplibreMap, this.config)
    } else {
      if (typeof theme !== 'string') {
        console.warn('Unovis | Leaflet Map: Invalid style. Provide a URL string for raster rendering mode.')
        return
      }
      layer.setUrl(theme)
    }
  }

  // We redefine the ComponentCore render function to bind event to newly created elements in this._renderData(),
  // which is being called after almost every map interaction
  render (): void {
    const { config } = this
    if (!this._map) return

    this._renderData()
    if (this._firstRender) {
      if (config.initialBounds) this.fitToBounds(config.initialBounds)
      else if (config.fitViewOnInit) this.fitToPoints(0, config.fitViewPadding)
    } else {
      if (config.fitViewOnUpdate) this.fitToPoints(0, config.fitViewPadding)
      else if (config.fitBoundsOnUpdate) this.fitToBounds(config.fitBoundsOnUpdate)
    }

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
    this._flyToBoundsAnimationFrameId = requestAnimationFrame(() => this._flyToBounds(bounds, duration, padding))
  }

  public fitToBounds (bounds: Bounds, duration = this.config.flyToDuration, padding = this.config.fitViewPadding): void {
    const { northEast, southWest } = bounds
    if (isNil(northEast) || isNil(southWest)) return
    if (isNil(northEast.lat) || isNil(northEast.lng)) return
    if (isNil(southWest.lat) || isNil(southWest.lng)) return
    if (!this._map || !this._map.leaflet) return
    this._flyToBoundsAnimationFrameId = requestAnimationFrame(() => this._flyToBounds([
      [northEast.lat, southWest.lng],
      [southWest.lat, northEast.lng],
    ], duration, padding))
  }

  /* Select a point by id and optionally center the map view.
   * This method was designed to be used mainly with the `[LeafletMap.selectors.point]` click events
   * (when the user actually clicks on a point) and the specified point is inside one of the collapsed
   * clusters it won't be selected. You can use the `zoomToPointById` method to achieve that.
   */
  public selectPointById (id: string, centerView = false): void {
    const { config } = this
    const pointData = this._getPointData()
    const foundPoint = pointData.find(d => (d.properties as LeafletMapPointDatum<Datum>).id === id)

    if (!foundPoint) {
      console.warn(`Unovis | Leaflet Map: Node with id ${id} can not be found`)
      return
    }

    if ((foundPoint.properties as LeafletMapClusterDatum<Datum>)?.cluster) {
      console.warn('Unovis | Leaflet Map: Cluster can\'t be selected')
      return
    }

    this._selectedPoint = foundPoint

    const isPointInsideExpandedCluster = this._expandedCluster?.points?.find(d => getString(d.properties, config.pointId) === id)
    if (!isPointInsideExpandedCluster) this._resetExpandedCluster()

    if (centerView) {
      const coordinates = {
        lng: getNumber(foundPoint.properties as LeafletMapPointDatum<Datum>, config.pointLongitude),
        lat: getNumber(foundPoint.properties as LeafletMapPointDatum<Datum>, config.pointLatitude),
      }

      const zoomLevel = this._map.leaflet.getZoom()
      this._eventInitiatedByComponent = true
      this._map.leaflet.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      this._renderData()
    }
  }

  /* Get the id of the selected point */
  public getSelectedPointId (): string | number | undefined {
    return this._selectedPoint?.id
  }

  /* Unselect point if it was selected before */
  public unselectPoint (): void {
    this._selectedPoint = null
    this._externallySelectedPoint = null
    this.render()
  }

  /** Get the currently expanded cluster */
  public getExpandedCluster (): { id: string; points: Datum[] } | undefined {
    if (!this._expandedCluster) return
    const id = this._expandedCluster.cluster?.id as string
    const points = this._expandedCluster.cluster?.clusterPoints.map(d => this.datamodel.data[(d as LeafletMapPointDatum<Datum>)._index])
    return { id, points }
  }

  /* Zoom to a point by id and optionally select it.
   * If the point is inside a cluster, it'll be automatically expanded to show the enclosed point.
   * You can also force set the zoom level by providing the `customZoomLevel` argument.
   */
  public zoomToPointById (id: string, selectPoint = false, customZoomLevel?: number): void {
    const { config, datamodel } = this
    if (!datamodel.data.length) {
      console.warn('Unovis | Leaflet Map: There are no points on the map')
      return
    }
    const dataBoundsAll = datamodel.getDataLatLngBounds(config.pointLatitude, config.pointLongitude)
    const bounds: [number, number, number, number] = [dataBoundsAll[0][1], dataBoundsAll[1][0], dataBoundsAll[1][1], dataBoundsAll[0][0]]
    const pointDataAll = this._getPointData(bounds)

    let foundPoint: LeafletMapPoint<Datum> | PointFeature<Datum> = pointDataAll
      .find((d: LeafletMapPoint<Datum>) => getString(d.properties as LeafletMapPointDatum<Datum>, config.pointId) === id)

    // If point was found and it's a cluster -> do nothing
    if ((foundPoint?.properties as LeafletMapClusterDatum<Datum>)?.cluster) {
      console.warn('Unovis | Leaflet Map: Cluster can\'t be zoomed in')
      return
    }

    // If point was not found -> search for it in all collapsed clusters
    if (!foundPoint) {
      const { point } = findPointAndClusterByPointId(pointDataAll, id, config.pointId)
      foundPoint = point
    }

    if (foundPoint) {
      // If point was found and it's inside an expanded cluster -> simply select it
      const isPointInsideExpandedCluster = this._expandedCluster?.points?.find(d => getString(d.properties, config.pointId) === id)
      if (isPointInsideExpandedCluster && selectPoint) {
        this._selectedPoint = foundPoint as LeafletMapPoint<Datum>
        this._renderData()
        return
      }

      // Else - trigger zoom
      this._externallySelectedPoint = foundPoint
      this._zoomingToExternallySelectedPoint = true

      this._forceExpandCluster = !isNil(customZoomLevel)
      if (selectPoint) this._selectedPoint = foundPoint as LeafletMapPoint<Datum>

      const zoomLevel = isNil(customZoomLevel) ? this._map.leaflet.getZoom() : customZoomLevel
      const pointDatum = foundPoint.properties as LeafletMapPointDatum<Datum>
      const coordinates = {
        lng: getNumber(pointDatum, config.pointLongitude),
        lat: getNumber(pointDatum, config.pointLatitude),
      }
      this._eventInitiatedByComponent = true
      this._map.leaflet.flyTo(coordinates, zoomLevel, { duration: 0 })
    } else {
      console.warn(`Unovis | Leaflet Map: Node with id ${id} can not be found`)
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
    const points = this._pointGroup.selectAll<SVGGElement, LeafletMapPoint<Datum>>(`.${s.point}:not(.exit)`)
      .data(pointData, (d: LeafletMapPoint<Datum>, i) => `${d.id || d.geometry.coordinates.join('')}`)

    points.exit<LeafletMapPoint<Datum>>().classed('exit', true).call(removeNodes)
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .call(createNodes)

    const pointsMerged = points.merge(pointsEnter)
    pointsEnter.call(updateNodes, config, this._map.leaflet)
    points.call(updateNodes, config, this._map.leaflet, mapMoveZoomUpdateOnly)
    pointsMerged.call(collideLabels, this._map.leaflet)

    this._clusterBackground.call(updateBackgroundNode, this._expandedCluster, config, this._map.leaflet, this._clusterBackgroundRadius)
    if (this._expandedCluster && config.clusterBackground) {
      pointData.forEach((d, i) => { d._zIndex = (d.properties as LeafletMapPointDatum<Datum>)?.expandedClusterPoint ? 2 : 0 })
      this._pointGroup
        .selectAll<SVGGElement, LeafletMapPoint<Datum>>(`.${s.point}, .${s.clusterBackground}, .${s.pointSelectionRing}`)
        .sort((a: LeafletMapPoint<Datum>, b: LeafletMapPoint<Datum>) => a._zIndex - b._zIndex)
    }

    // Show selection border and hide it when the node
    // is out of visible box
    if (config.selectedPointId) {
      const foundPoint = pointData.find(d => getString(d.properties as LeafletMapPointDatum<Datum>, config.pointId) === config.selectedPointId)
      const { cluster } = findPointAndClusterByPointId(pointData, config.selectedPointId, config.pointId)
      if (foundPoint) this._selectedPoint = foundPoint
      else this._selectedPoint = cluster
    }
    this._pointSelectionRing.call(updateNodeSelectionRing, this._selectedPoint, pointData, config, this._map.leaflet)

    // Set up events and attributes for the rendered points
    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()

    // Tooltip
    config.tooltip?.update()
  }

  private _zoomToExternallySelectedPoint (): void {
    const { config } = this
    if (!this._externallySelectedPoint) return

    const externallySelectedPointDatum = this._externallySelectedPoint.properties as LeafletMapPointDatum<Datum>
    const externallySelectedPointId = getString(externallySelectedPointDatum, config.pointId)
    const pointData = this._getPointData()
    const foundPoint: LeafletMapPoint<Datum> = pointData.find(
      d => getString(d.properties as Datum, config.pointId) === externallySelectedPointId
    )

    if (foundPoint) {
      this._zoomingToExternallySelectedPoint = false
      this._currentZoomLevel = null
    } else {
      const { cluster } = findPointAndClusterByPointId(pointData, externallySelectedPointId, config.pointId)
      if (!cluster) return

      const zoomLevel = this._map.leaflet.getZoom()
      // Expand cluster or fly further
      if (this._forceExpandCluster || shouldClusterExpand(cluster, zoomLevel, 8, 13)) {
        this._expandCluster(cluster)
      } else {
        const newZoomLevel = getNextZoomLevelOnClusterClick(zoomLevel)
        const coordinates = {
          lng: getNumber(externallySelectedPointDatum, config.pointLongitude),
          lat: getNumber(externallySelectedPointDatum, config.pointLatitude),
        }
        if (this._currentZoomLevel !== newZoomLevel) {
          this._currentZoomLevel = newZoomLevel
          this._eventInitiatedByComponent = true
          this._map.leaflet.flyTo(coordinates, newZoomLevel, { duration: 0 })
        }
      }
    }
  }

  private _expandCluster (clusterPoint: LeafletMapPoint<Datum>, preventRender?: boolean): void {
    const { config, config: { clusterBackground } } = this
    const padding = 1

    config.tooltip?.hide()

    this._forceExpandCluster = false
    if (clusterPoint) {
      const points: PointFeature<PointExpandedClusterProperties<Datum>>[] =
        clusterPoint.clusterIndex.getLeaves((clusterPoint.properties as LeafletMapClusterDatum<Datum>).cluster_id as number, Infinity)
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

      if (!preventRender) this._renderData()
    }

    this._zoomingToExternallySelectedPoint = false
  }

  private _resetExpandedCluster (): void {
    this._expandedCluster?.points?.forEach(d => { delete d.properties.expandedClusterPoint })
    this._expandedCluster = null
  }

  private _getPointData (customBounds?: [number, number, number, number]): LeafletMapPoint<Datum>[] {
    const { config, datamodel: { data } } = this

    if (!data || !this._clusterIndex) return []

    let geoJSONPoints: (ClusterFeature<LeafletMapClusterDatum<Datum>> | PointFeature<PointExpandedClusterProperties<Datum>>)[] =
      getClustersAndPoints<Datum>(this._clusterIndex, this._map.leaflet, customBounds)

    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      geoJSONPoints = geoJSONPoints.filter(c => (c as ClusterFeature<LeafletMapClusterDatum<Datum>>).properties.cluster_id !== (this._expandedCluster.cluster.properties as LeafletMapClusterDatum<Datum>).cluster_id)
      // Add points from the expanded cluster
      geoJSONPoints = geoJSONPoints.concat(this._expandedCluster.points)
    }

    const pointData = geoJSONPoints
      // Todo: Remove explicitly set ClusterFeature<LeafletMapPointDatum<Datum>> type
      .map((d, i: number) => {
        return geoJsonPointToScreenPoint(d as ClusterFeature<LeafletMapPointDatum<Datum>>, i, this._map.leaflet, config)
      })
      // .sort((a, b) => getPointDisplayOrder(a, config.pointStatus, config.colorMap) - getPointDisplayOrder(b, config.pointStatus, config.colorMap))

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
    this._renderDataAnimationFrameId = requestAnimationFrame(() => {
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

    constraintMapViewThrottled(this._map.leaflet)
    const events = this._map.layer.getEvents()

    if (events.zoomend) {
      const zoomEndEvent = events.zoomend.bind(this._map.layer)
      zoomEndEvent(null)
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

    if ((d.properties as LeafletMapClusterDatum<Datum>).cluster) {
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
    cancelAnimationFrame(this._renderDataAnimationFrameId)
    cancelAnimationFrame(this._flyToBoundsAnimationFrameId)
    const map = this._map?.leaflet
    this._map = undefined

    map?.stop()
    map?.remove()
    this.g.remove()
    this.resizeObserver.disconnect()
    this.themeObserver?.disconnect()
  }
}
