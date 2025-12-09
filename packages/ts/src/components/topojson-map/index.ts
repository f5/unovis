import { Selection, select } from 'd3-selection'
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { timeout } from 'd3-timer'
import { easeCubicInOut } from 'd3-ease'
import { geoPath, GeoProjection, ExtendedFeatureCollection } from 'd3-geo'
import { color } from 'd3-color'
import { packSiblings } from 'd3-hierarchy'
import { feature } from 'topojson-client'
import Supercluster from 'supercluster'

// Core
import { ComponentCore } from 'core/component'
import { MapGraphDataModel } from 'data-models/map-graph'

// Utils
import { clamp, getNumber, getString, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor, hexToBrightness } from 'utils/color'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'

// Types
import { MapLink } from 'types/map'

// Local Types
import {
  MapData,
  MapFeature,
  MapPointLabelPosition,
  MapProjection,
  TopoJSONMapPointShape,
  TopoJSONMapPoint,
  TopoJSONMapClusterDatum,
  TopoJSONMapPointDatum,
} from './types'

// Config
import { TopoJSONMapDefaultConfig, TopoJSONMapConfigInterface } from './config'

// Modules
import {
  arc,
  getLonLat,
  getDonutData,
  getPointPathData,
  calculateClusterIndex,
  getClustersAndPoints,
  geoJsonPointToScreenPoint,
  getNextZoomLevelOnClusterClick,
} from './utils'
import { updateDonut } from './modules/donut'

// Styles
import * as s from './style'

export class TopoJSONMap<
  AreaDatum,
  PointDatum = unknown,
  LinkDatum = unknown,
> extends ComponentCore<
  MapData<AreaDatum, PointDatum, LinkDatum>,
  TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  > {
  static selectors = s
  protected _defaultConfig = TopoJSONMapDefaultConfig as TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
  public config: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> = this._defaultConfig

  datamodel: MapGraphDataModel<AreaDatum, PointDatum, LinkDatum> = new MapGraphDataModel()
  g: Selection<SVGGElement, unknown, null, undefined>
  private _firstRender = true
  private _isResizing = false
  private _initialScale: number = undefined
  private _center: [number, number]
  private _currentZoomLevel: number = undefined
  private _transform: ZoomTransform
  private _path = geoPath()
  private _projection: GeoProjection
  private _prevWidth: number
  private _prevHeight: number
  private _animFrameId: number
  private _clusterIndex: Supercluster<PointDatum> | null = null
  private _expandedCluster: {
    cluster: TopoJSONMapPoint<PointDatum>;
    points: any[];
  } | null = null

  private _eventInitiatedByComponent = false

  private _featureCollection: GeoJSON.FeatureCollection
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown> = zoom()
  private _backgroundRect = this.g.append('rect').attr('class', s.background)
  private _featuresGroup = this.g.append('g').attr('class', s.features)
  private _linksGroup = this.g.append('g').attr('class', s.links)
  private _pointsGroup = this.g.append('g').attr('class', s.points)

  events = {
    [TopoJSONMap.selectors.point]: {},
    [TopoJSONMap.selectors.feature]: {},
  }

  constructor (config?: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>, data?: MapData<AreaDatum, PointDatum, LinkDatum>) {
    super()
    this._zoomBehavior.on('zoom', this._onZoom.bind(this))

    if (config) this.setConfig(config)
    if (data) this.setData(data)

    this.g.append('defs')
      .append('filter')
      .attr('id', 'heatmapFilter')
      .html(`
        <feGaussianBlur in="SourceGraphic" stdDeviation="${this.config.heatmapModeBlurStdDeviation}" color-interpolation-filters="sRGB" result="blur"></feGaussianBlur>
        <feColorMatrix class="blurValues" in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -4"></feColorMatrix>
      `)
  }

  setData (data: MapData<AreaDatum, PointDatum, LinkDatum>): void {
    const { config } = this

    this.datamodel.pointId = config.pointId
    this.datamodel.linkSource = config.linkSource
    this.datamodel.linkTarget = config.linkTarget
    this.datamodel.data = data

    // Reset expanded cluster when data changes
    this._resetExpandedCluster()

    // Initialize clustering if enabled
    if (config.clustering && data.points?.length) {
      const dataValid = data.points.filter(d => {
        const lat = getNumber(d, config.latitude)
        const lon = getNumber(d, config.longitude)
        return isNumber(lat) && isNumber(lon)
      })

      this._clusterIndex = calculateClusterIndex(dataValid as any, this.config as any) as any
    } else {
      this._clusterIndex = null
    }

    // If there was a data change and mapFitToPoints is enabled, we will need to re-fit the map
    this._firstRender = this._firstRender || config.mapFitToPoints
  }

  setConfig (config?: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>): void {
    super.setConfig(config)

    // Setting the default here instead of defaultConfig to prevent mutation from other TopoJSONMap instances
    const newProjection = this.config.projection ?? MapProjection.Kavrayskiy7()
    if (this._projection) {
      newProjection.scale(this._projection.scale()).translate(this._projection.translate())
    }
    this._projection = newProjection
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    this._renderBackground()
    this._renderMap(duration)
    this._renderGroups(duration)
    this._renderLinks(duration)
    this._renderPoints(duration)

    // When animation is running we need to temporary disable zoom behaviour
    if (duration && !config.disableZoom) {
      this.g.on('.zoom', null)
      timeout(() => {
        this.g.call(this._zoomBehavior)
      }, duration)
    }

    // When zoom behaviour is active we assign the `draggable` class to show the grabbing cursor
    this.g.classed('draggable', !config.disableZoom)
    this._firstRender = false
  }

  _renderBackground (): void {
    this._backgroundRect
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('transform', `translate(${-this.bleed.left}, ${-this.bleed.top})`)
  }

  _renderGroups (duration: number): void {
    const transformString = this._transform.toString()
    smartTransition(this._featuresGroup, duration)
      .attr('transform', transformString)
      .attr('stroke-width', 1 / this._currentZoomLevel)

    smartTransition(this._linksGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._pointsGroup, duration)
      .attr('transform', transformString)
  }

  _renderMap (duration: number): void {
    const { bleed, config, datamodel } = this

    this.g.attr('transform', `translate(${bleed.left}, ${bleed.top})`)
    const mapData: TopoJSON.Topology = config.topojson
    const featureName = config.mapFeatureName
    const featureObject = mapData?.objects?.[featureName]
    if (!featureObject) return

    this._featureCollection = feature(mapData, featureObject) as GeoJSON.FeatureCollection
    const featureData = (this._featureCollection?.features ?? []) as MapFeature<AreaDatum>[]

    if (this._firstRender) {
      // Rendering the map for the first time.
      this._projection.fitExtent([[0, 0], [this._width, this._height]], this._featureCollection)
      this._initialScale = this._projection.scale()
      this._center = this._projection.translate()

      if (config.mapFitToPoints) {
        this._fitToPoints()
      }

      const zoomExtent = config.zoomExtent
      this._zoomBehavior.scaleExtent([zoomExtent[0] * this._initialScale, zoomExtent[1] * this._initialScale])
      this.setZoom(config.zoomFactor || 1)

      if (!config.disableZoom) {
        this.g.call(this._zoomBehavior)
        this._applyZoom()
      }

      this._prevWidth = this._width
      this._prevHeight = this._height
    }

    if (this._prevWidth !== this._width || this._prevHeight !== this._height) {
      this._onResize()
    }


    this._path.projection(this._projection)

    // Merge passed area data and map feature data
    const areaData = datamodel.areas
    areaData.forEach(a => {
      const feature = featureData.find(f => f.id.toString() === getString(a, config.areaId).toString())
      if (feature) feature.data = a
      else if (this._firstRender) console.warn(`Can't find feature by area code ${getString(a, config.areaId)}`)
    })

    const features = this._featuresGroup
      .selectAll<SVGPathElement, unknown>(`.${s.feature}`)
      .data(featureData)

    const featuresEnter = features.enter().append('path').attr('class', s.feature)
    smartTransition(featuresEnter.merge(features), duration)
      .attr('d', this._path)
      .style('fill', (d, i) => d.data ? getColor(d.data, config.areaColor, i) : null)
      .style('cursor', d => d.data ? getString(d.data, config.areaCursor) : null)
    features.exit().remove()
  }

  _renderLinks (duration: number): void {
    const { config, datamodel } = this
    const links = datamodel.links

    const edges = this._linksGroup
      .selectAll<SVGPathElement, MapLink<PointDatum, LinkDatum>>(`.${s.link}`)
      .data(links, (d, i) => getString(d, config.linkId, i))

    const edgesEnter = edges.enter().append('path').attr('class', s.link)
      .style('stroke-width', 0)

    smartTransition(edgesEnter.merge(edges), duration)
      .attr('d', link => {
        const source = this._projection(getLonLat(link.source, config.longitude, config.latitude))
        const target = this._projection(getLonLat(link.target, config.longitude, config.latitude))
        return arc(source, target)
      })
      .style('stroke-width', link => getNumber(link, config.linkWidth) / this._currentZoomLevel)
      .style('cursor', link => getString(link, config.linkCursor))
      .style('stroke', (link, i) => getColor(link, config.linkColor, i))
    edges.exit().remove()
  }

  private _getPointData (): TopoJSONMapPoint<PointDatum>[] {
    const { config, datamodel } = this

    if (!config.clustering || !this._clusterIndex) {
      // Return regular points when clustering is disabled
      return datamodel.points.map((d, i) => {
        const pos = this._projection(getLonLat(d, config.longitude, config.latitude))
        const radius = getNumber(d, config.pointRadius)
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const donutData = getDonutData(d, config.colorMap)
        const pointColor = getColor(d, config.pointColor, i)

        return {
          geometry: { type: 'Point', coordinates: getLonLat(d, config.longitude, config.latitude) },
          bbox: { x1: pos[0] - radius, y1: pos[1] - radius, x2: pos[0] + radius, y2: pos[1] + radius },
          radius,
          path: getPointPathData({ x: 0, y: 0 }, radius, shape),
          color: pointColor,
          id: getString(d, config.pointId, i),
          properties: d as TopoJSONMapPointDatum<PointDatum>,
          donutData,
          isCluster: false,
          _zIndex: 0,
        } as TopoJSONMapPoint<PointDatum>
      })
    }

    // Get bounds for clustering
    const bounds = this._projection.invert ? [
      this._projection.invert([0, this._height])[0],
      this._projection.invert([0, this._height])[1],
      this._projection.invert([this._width, 0])[0],
      this._projection.invert([this._width, 0])[1],
    ] as [number, number, number, number] : [-180, -90, 180, 90] as [number, number, number, number]

    const zoom = Math.round(this._currentZoomLevel || 1)
    let geoJsonPoints = getClustersAndPoints(this._clusterIndex as any, bounds, zoom)

    // Handle expanded cluster points - replace the expanded cluster with individual points
    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      geoJsonPoints = geoJsonPoints.filter((c: any) => c.properties.clusterId !== (this._expandedCluster?.cluster.properties as any).clusterId)
      // Add points from the expanded cluster
      geoJsonPoints = geoJsonPoints.concat(this._expandedCluster.points as any)
    }

    return geoJsonPoints.map((geoPoint, i) =>
      geoJsonPointToScreenPoint(geoPoint as any, i, this._projection, this.config as any, this._currentZoomLevel || 1)
    ) as any
  }

  _renderPoints (duration: number): void {
    const { config } = this
    const hasColorMap = config.colorMap && Object.keys(config.colorMap).length > 0
    const pointData = this._getPointData()


    const points = this._pointsGroup
      .selectAll<SVGGElement, TopoJSONMapPoint<PointDatum>>(`.${s.point}`)
      .data(pointData, (d, i) => d.id.toString())

    // Enter
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .attr('transform', d => {
        const pos = this._projection(d.geometry.coordinates as [number, number])
        const expandedPoint = d as any
        const dx = expandedPoint.dx || 0
        const dy = expandedPoint.dy || 0
        return `translate(${pos[0] + dx},${pos[1] + dy})`
      })
      .style('opacity', 0)

    pointsEnter.append('path').attr('class', s.pointCircle)
      .attr('d', 'M0,0')
      .style('fill', (d, i) => d.color)
      .style('stroke-width', d => getNumber(d.properties as PointDatum, config.pointStrokeWidth))

    // Add donut chart group
    pointsEnter.append('g').attr('class', 'donut-group')

    pointsEnter.append('text').attr('class', s.pointLabel)
      .style('opacity', 0)

    // Update
    const pointsMerged = pointsEnter.merge(points)
    smartTransition(pointsMerged, duration)
      .attr('transform', d => {
        const pos = this._projection(d.geometry.coordinates as [number, number])
        const expandedPoint = d as any
        const dx = expandedPoint.dx || 0
        const dy = expandedPoint.dy || 0
        return `translate(${pos[0] + dx},${pos[1] + dy})`
      })
      .style('cursor', d => {
        return (d.isCluster && (config.clusterExpandOnClick || hasColorMap)) ? 'pointer' : getString(d.properties as PointDatum, config.pointCursor)
      })
      .style('opacity', 1)

    // Cursor is handled by the parent point element

    // Add click event handler for clusters
    pointsMerged
      .style('pointer-events', 'all') // Ensure pointer events are enabled
      .on('click', (event: MouseEvent, d: TopoJSONMapPoint<PointDatum>) => {
        this._onPointClick(d, event)
      })


    smartTransition(pointsMerged.select(`.${s.pointCircle}`), duration)
      .attr('d', d => {
        const radius = d.radius / (this._currentZoomLevel || 1)
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        return getPointPathData({ x: 0, y: 0 }, radius, shape)
      })
      .style('fill', d => {
        const donutData = d.donutData
        const shape = getString(d.properties as any, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const expandedPoint = d as any

        // For expanded cluster points, use the preserved cluster color
        if (expandedPoint.expandedClusterPoint) {
          return expandedPoint.clusterColor || expandedPoint.expandedClusterPoint.color
        }

        if (donutData.length > 0) return 'transparent'
        return isRing ? 'transparent' : d.color
      })
      .style('stroke', d => {
        const expandedPoint = d as any
        // For expanded cluster points, use the preserved cluster color
        if (expandedPoint.expandedClusterPoint) {
          return expandedPoint.clusterColor || expandedPoint.expandedClusterPoint.color
        }
        return d.color
      })
      .style('stroke-width', d => {
        const shape = getString(d.properties as any, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const baseStrokeWidth = isRing ? getNumber(d.properties as any, config.pointRingWidth) : getNumber(d.properties as any, config.pointStrokeWidth)
        return baseStrokeWidth / (this._currentZoomLevel || 1)
      })

    // Update donut charts
    const currentZoomLevel = this._currentZoomLevel
    pointsMerged.select('.donut-group')
      .style('pointer-events', 'none') // Allow clicks to pass through donut charts
      .each(function (d) {
        if (d.donutData.length > 0) {
          const radius = getNumber(d.properties as any, config.pointRadius, 0) / (currentZoomLevel || 1)
          const arcWidth = (d.isCluster ? 4 : 2) / (currentZoomLevel || 1) // Thicker ring for clusters
          updateDonut(select(this as SVGGElement), d.donutData, radius, arcWidth, 0.05)
        } else {
          select(this as SVGGElement).selectAll('*').remove()
        }
      })

    const pointLabelsMerged = pointsMerged.select(`.${s.pointLabel}`)
    pointLabelsMerged
      .text(d => getString(d.properties as any, config.pointLabel) ?? '')
      .style('font-size', d => {
        if (config.pointLabelPosition === MapPointLabelPosition.Bottom) {
          return `calc(var(--vis-map-point-label-font-size) / ${this._currentZoomLevel}`
        }
        const pointDiameter = 2 * getNumber(d.properties as any, config.pointRadius, 0)
        const pointLabelText = getString(d.properties as any, config.pointLabel) || ''
        const textLength = pointLabelText.length
        const fontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)
        return clamp(fontSize, fontSize, 16)
      })
      .attr('y', d => {
        if (config.pointLabelPosition === MapPointLabelPosition.Center) return null

        const pointRadius = getNumber(d.properties as any, config.pointRadius, 0) / this._currentZoomLevel
        return pointRadius
      })
      .attr('dy', config.pointLabelPosition === MapPointLabelPosition.Center ? '0.32em' : '1em')

    smartTransition(pointLabelsMerged, duration)
      .style('fill', (d, i) => {
        if (config.pointLabelPosition === MapPointLabelPosition.Bottom) return null

        const pointColor = getColor(d.properties as any, config.pointColor, i)
        const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
        if (!hex) return null

        const brightness = hexToBrightness(hex)
        return brightness > config.pointLabelTextBrightnessRatio ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
      })
      .style('opacity', 1)

    // Exit
    points.exit().remove()

    // Heatmap
    this._pointsGroup.style('filter', (config.heatmapMode && this._currentZoomLevel < config.heatmapModeZoomLevelThreshold) ? 'url(#heatmapFilter)' : null)
    this._pointsGroup.selectAll(`.${s.pointLabel}`).style('display', (config.heatmapMode && (this._currentZoomLevel < config.heatmapModeZoomLevelThreshold)) ? 'none' : null)
  }

  _fitToPoints (points?: PointDatum[], pad = 0.1): void {
    const { config, datamodel } = this
    const pointData = points || datamodel.points
    if (pointData.length === 0) return

    this.fitView()

    const featureCollection: ExtendedFeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPoint',
          coordinates: pointData.map(p => {
            return [
              getNumber(p, d => getNumber(d, config.longitude)),
              getNumber(p, d => getNumber(d, config.latitude)),
            ]
          }),
        },
      }],
    }

    this._projection.fitExtent([
      [this._width * pad, this._height * pad],
      [this._width * (1 - pad), this._height * (1 - pad)],
    ], featureCollection)

    const maxScale = config.zoomExtent[1] * this._initialScale
    const fittedScale = this._projection.scale()

    if (fittedScale > maxScale) {
      const fittedTranslate = this._projection.translate()
      const scaleRatio = maxScale / fittedScale

      this._projection.scale(maxScale)
      this._projection.translate([
        this._width / 2 - (this._width / 2 - fittedTranslate[0]) * scaleRatio,
        this._height / 2 - (this._height / 2 - fittedTranslate[1]) * scaleRatio,
      ])
    }

    // If we don't update the center, the next zoom will be centered around the previous value
    this._center = this._projection.translate()
    this._applyZoom()
  }

  _applyZoom (): void {
    const translate = this._center ?? this._projection.translate()
    const scale = this._initialScale * this._currentZoomLevel
    this.g.call(this._zoomBehavior.transform, zoomIdentity.translate(translate[0], translate[1]).scale(scale))
  }

  _onResize (): void {
    this._isResizing = true
    const prevTranslate = this._projection.translate()

    this._projection.fitExtent([[0, 0], [this._width, this._height]], this._featureCollection)
    this._initialScale = this._projection.scale()
    this._center = [
      this._projection.translate()[0] * this._center[0] / prevTranslate[0],
      this._projection.translate()[1] * this._center[1] / prevTranslate[1],
    ]
    this._applyZoom()

    this._isResizing = false
    this._prevWidth = this._width
    this._prevHeight = this._height
  }

  _onZoom (event: D3ZoomEvent<any, any>): void {
    if (this._firstRender) return // To prevent double render because of binding zoom behaviour
    const isMouseEvent = event.sourceEvent !== undefined
    const isExternalEvent = !event?.sourceEvent && !this._isResizing

    // Reset expanded cluster when manually zooming (but not during component-initiated zoom)
    if (isMouseEvent && !this._eventInitiatedByComponent) this._resetExpandedCluster()

    // Reset the flag after handling the zoom
    if (this._eventInitiatedByComponent && !isMouseEvent) {
      this._eventInitiatedByComponent = false
    }

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(this._onZoomHandler.bind(this, event.transform, isMouseEvent, isExternalEvent))

    if (isMouseEvent) {
      // Update the center coordinate so that the next call to _applyZoom()
      // will zoom with respect to the current view
      this._center = [event.transform.x, event.transform.y]
    }
    this._currentZoomLevel = (event?.transform.k / this._initialScale) || 1
  }

  _onZoomHandler (transform: ZoomTransform, isMouseEvent: boolean, isExternalEvent: boolean): void {
    const scale = transform.k / this._initialScale || 1
    const center = this._projection.translate()

    this._transform = zoomIdentity
      .translate(transform.x - center[0] * scale, transform.y - center[1] * scale)
      .scale(scale)

    const customDuration = isExternalEvent
      ? this.config.zoomDuration
      : (isMouseEvent ? 0 : null)

    // Call render functions that depend on this._transform
    this._renderGroups(customDuration)
    this._renderLinks(customDuration)
    this._renderPoints(customDuration)
  }

  public zoomIn (increment = 0.5): void {
    this.setZoom(this._currentZoomLevel + increment)
  }

  public zoomOut (increment = 0.5): void {
    this.setZoom(this._currentZoomLevel - increment)
  }

  public setZoom (zoomLevel: number): void {
    const { config } = this
    this._currentZoomLevel = clamp(zoomLevel, config.zoomExtent[0], config.zoomExtent[1])
    this._transform = zoomIdentity
      .translate(this._center[0] * (1 - this._currentZoomLevel), this._center[1] * (1 - this._currentZoomLevel))
      .scale(this._currentZoomLevel)
    // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
    // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
    // that the zoom state has changed
    this._applyZoom()
  }

  public fitView (): void {
    this._projection.fitExtent([[0, 0], [this._width, this._height]], this._featureCollection)
    this._currentZoomLevel = (this._projection?.scale() / this._initialScale) || 1
    this._center = this._projection.translate()
    // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
    // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
    // that the zoom state has changed
    this._applyZoom()
  }

  private _onPointClick (d: TopoJSONMapPoint<PointDatum>, event: MouseEvent): void {
    const { config } = this
    event.stopPropagation()

    // Handle clicking on expanded cluster points to collapse them
    const expandedPoint = d as any
    if (expandedPoint.expandedClusterPoint) {
      this._resetExpandedCluster()
      this._renderPoints(config.duration)
      return
    }

    if (d.isCluster && (d.properties as TopoJSONMapClusterDatum<PointDatum>).cluster) {
      // Enable click expansion when clusterExpandOnClick is true OR when colorMap is enabled (for pie chart clusters)
      const hasColorMap = config.colorMap && Object.keys(config.colorMap).length > 0

      if (config.clusterExpandOnClick || hasColorMap) {
        // Always expand the cluster to show individual points
        const expandedPoints = this._expandCluster(d)

        // Calculate the geographic center (centroid) of the expanded points and zoom to it
        if (expandedPoints && expandedPoints.length > 0) {
          const avgLat = expandedPoints.reduce((sum, p) => sum + getNumber(p, config.latitude), 0) / expandedPoints.length
          const avgLon = expandedPoints.reduce((sum, p) => sum + getNumber(p, config.longitude), 0) / expandedPoints.length
          const centroidCoordinates: [number, number] = [avgLon, avgLat]

          // Calculate appropriate zoom level
          const newZoomLevel = getNextZoomLevelOnClusterClick(this._currentZoomLevel || 1)

          // Start zoom immediately for smoother transition
          this._zoomToLocation(centroidCoordinates, newZoomLevel)
        }
      }
    }
  }

  private _expandCluster (clusterPoint: TopoJSONMapPoint<PointDatum>): PointDatum[] | undefined {
    const { config } = this

    if (!clusterPoint.clusterIndex) return undefined

    const padding = 1
    const clusterId = (clusterPoint.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId as number
    const points = clusterPoint.clusterIndex.getLeaves(clusterId, Infinity)

    // Calculate positions for expanded points using d3.packSiblings (same as leaflet map)
    const packPoints: {x: number; y: number; r: number }[] = points.map(() => ({
      x: 0,
      y: 0,
      r: 8 + padding, // Base radius for individual points
    }))
    packSiblings(packPoints)

    // Create expanded points with relative positions
    const expandedPoints = points.map((point, i) => {
      const originalData = point.properties as PointDatum
      const radius = getNumber(originalData, config.pointRadius) || 8
      const shape = getString(originalData, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
      const donutData = getDonutData(originalData, config.colorMap)
      // Use the cluster's exact color for all expanded points to maintain visual consistency
      const pointColor = clusterPoint.color

      return {
        geometry: { type: 'Point' as const, coordinates: clusterPoint.geometry.coordinates },
        bbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
        radius,
        path: getPointPathData({ x: 0, y: 0 }, radius, shape),
        color: pointColor,
        id: getString(originalData, config.pointId, i),
        properties: originalData,
        donutData,
        isCluster: false,
        _zIndex: 1,
        expandedClusterPoint: clusterPoint,
        clusterColor: pointColor, // Preserve the cluster color
        dx: packPoints[i].x,
        dy: packPoints[i].y,
      } as TopoJSONMapPoint<PointDatum> & { expandedClusterPoint: TopoJSONMapPoint<PointDatum>; dx: number; dy: number }
    })

    this._resetExpandedCluster()
    this._expandedCluster = {
      cluster: clusterPoint,
      points: expandedPoints,
    }

    // Re-render to show expanded points with smooth animation
    this._renderPoints(config.duration / 2)

    // Return the original point data for centroid calculation
    return points.map(p => p.properties as PointDatum)
  }

  private _zoomToLocation (coordinates: [number, number], zoomLevel: number): void {
    const { config } = this

    const clampedZoomLevel = clamp(zoomLevel, config.zoomExtent[0], config.zoomExtent[1])

    // Project the target coordinates using the current projection
    const targetPoint = this._projection(coordinates)
    if (!targetPoint) return

    // Calculate the center of the viewport
    const centerX = this._width / 2
    const centerY = this._height / 2

    // Calculate the scale factor
    const k = this._initialScale * clampedZoomLevel

    // Calculate translation to center the target point
    // We need to account for the current projection center
    const currentCenter = this._projection.translate()
    const x = currentCenter[0] + (centerX - targetPoint[0]) * (k / this._initialScale)
    const y = currentCenter[1] + (centerY - targetPoint[1]) * (k / this._initialScale)

    const transform = zoomIdentity.translate(x, y).scale(k)

    // Update internal state
    this._currentZoomLevel = clampedZoomLevel
    this._center = [x, y]

    // Set flag to indicate this is a component-initiated zoom
    this._eventInitiatedByComponent = true

    // Apply the transform with smooth eased animation
    this.g
      .transition()
      .duration(config.zoomDuration)
      .ease(easeCubicInOut)
      .call(this._zoomBehavior.transform, transform)
  }

  private _resetExpandedCluster (): void {
    this._expandedCluster?.points?.forEach((d: any) => { delete d.expandedClusterPoint })
    this._expandedCluster = null
  }

  destroy (): void {
    window.cancelAnimationFrame(this._animFrameId)
  }
}
