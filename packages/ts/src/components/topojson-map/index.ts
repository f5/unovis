import { Selection, select } from 'd3-selection'
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { timeout } from 'd3-timer'
import { easeCubicInOut } from 'd3-ease'
import { geoPath, GeoProjection, ExtendedFeatureCollection } from 'd3-geo'
import { color } from 'd3-color'
import { packSiblings } from 'd3-hierarchy'
import { feature } from 'topojson-client'

// Core
import { ComponentCore } from 'core/component'
import { MapGraphDataModel } from 'data-models/map-graph'

// Utils
import { clamp, getNumber, getString, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor, hexToBrightness } from 'utils/color'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'
import { trimStringMiddle } from 'utils/text'
// Types
import { MapLink } from 'types/map'
import { GenericDataRecord } from 'types/data'
import Supercluster, { PointFeature, ClusterFeature } from 'supercluster'
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/accessor'

// Local Types
import {
  MapData,
  MapFeature,
  MapPointLabelPosition,
  MapProjection,
  TopoJSONMapPointShape,
  FlowParticle,
  TopoJSONMapPoint,
  TopoJSONMapClusterDatum,
  TopoJSONMapPointDatum,
  TopoJSONMapPieDatum,
  ExpandedClusterPoint,
  CollapsedClusterFeature,
  PointOrClusterProperties,
} from './types'

// Config
import { TopoJSONMapDefaultConfig, TopoJSONMapConfigInterface } from './config'

// Modules
import {
  arc,
  getLonLat,
  getDonutData,
  getPointPathData,
  collideAreaLabels,
  collidePointBottomLabels,
  getPointRadius,
  calculateClusterIndex,
  getClustersAndPoints,
  geoJsonPointToScreenPoint,
  getNextZoomLevelOnClusterClick,
  getClusterRadius,
  PackedPoint,
} from './utils'
import { updateDonut } from './modules/donut'
import { renderBackground } from './modules/background'
import { updateSelectionRing } from './modules/selectionRing'
import { initFlowFeatures, updateFlowParticles, FlowInitContext, FlowUpdateContext } from './modules/flow'

// Styles
import * as s from './style'

// Supercluster expects zoom levels 0-22 (like map tiles). zoomExtent[1] is a scale factor
// for the map, so we cap the cluster maxZoom to avoid excessive quadtree depth and wrong
// packing/expansion behavior when zoomExtent has large values (e.g. 1000).
const SUPERCLUSTER_MAX_ZOOM = 22

export class TopoJSONMap<
  AreaDatum,
  PointDatum = GenericDataRecord,
  LinkDatum = GenericDataRecord,
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
  private _transform: ZoomTransform = zoomIdentity
  private _path = geoPath()
  private _projection: GeoProjection
  private _prevWidth: number
  private _prevHeight: number
  private _animFrameId: number
  private _isZooming = false
  private _zoomEndTimeoutId: ReturnType<typeof setTimeout>
  private _collisionDetectionAnimFrameId: ReturnType<typeof requestAnimationFrame>
  private _clusterIndex: Supercluster<PointDatum> | null = null
  private _expandedCluster: {
    cluster: TopoJSONMapPoint<PointDatum>;
    points: ExpandedClusterPoint<PointDatum>[];
  } | null = null

  private _collapsedCluster: CollapsedClusterFeature<PointDatum> | null = null
  private _collapsedClusterPointIds: Set<string> | null = null
  private _prevZoomToLocation: { coordinates: [number, number]; zoomLevel: number; expandCluster?: boolean } | undefined = undefined

  private _eventInitiatedByComponent = false

  private _featureCollection: GeoJSON.FeatureCollection
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown> = zoom()
  private _backgroundRect = this.g.append('rect').attr('class', s.background)
  private _featuresGroup = this.g.append('g').attr('class', s.features)
  private _areaLabelsGroup = this.g.append('g').attr('class', s.areaLabel)
  private _linksGroup = this.g.append('g').attr('class', s.links)
  private _clusterBackgroundGroup = this.g.append('g').attr('class', s.clusterBackground)
  private _flowParticlesGroup = this.g.append('g').attr('class', s.flowParticles)
  // Points after links + flow groups so map nodes paint above link arcs and flow particles
  private _pointsGroup = this.g.append('g').attr('class', s.points)
  private _pointSelectionRing = this._pointsGroup.append('g').attr('class', s.pointSelectionRing)
    .call(sel => sel.append('path').attr('class', s.pointSelection))

  private _sourcePointsGroup = this.g.append('g').attr('class', s.sourcePoints)
  private _selectedPoint: TopoJSONMapPoint<PointDatum> | null = null
  private _flowParticles: FlowParticle[] = []
  private _sourcePoints: { x: number; y: number; radius: number; color: string; flowData: LinkDatum }[] = []
  private _animationId: number | null = null

  events = {
    [TopoJSONMap.selectors.point]: {},
    [TopoJSONMap.selectors.feature]: {},
  }

  constructor (config?: TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>, data?: MapData<AreaDatum, PointDatum, LinkDatum>) {
    super()
    this._zoomBehavior
      .on('zoom', this._onZoom.bind(this))
      .on('end', this._onZoomEnd.bind(this))

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
      const zoomExtent = this.config.zoomExtent
      const maxClusterZoomLevel = Array.isArray(zoomExtent) ? Math.min(zoomExtent[1], SUPERCLUSTER_MAX_ZOOM) : 16
      this._clusterIndex = calculateClusterIndex(dataValid, this.config, maxClusterZoomLevel)
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
    this._renderAreaLabels(duration)
    this._renderGroups(duration)
    this._renderLinks(duration)
    this._renderClusterBackground(duration)
    this._renderPoints(duration)

    // Flow features
    if (config.enableFlowAnimation) {
      this._initFlowFeatures()
      this._renderSourcePoints(duration)
      this._renderFlowParticles(duration)
      this._startFlowAnimation()
    } else {
      this._stopFlowAnimation()
    }

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

    // Apply zoomToLocation if it changed
    if (config.zoomToLocation) {
      const hasChanged = !this._prevZoomToLocation ||
        this._prevZoomToLocation.coordinates[0] !== config.zoomToLocation.coordinates[0] ||
        this._prevZoomToLocation.coordinates[1] !== config.zoomToLocation.coordinates[1] ||
        this._prevZoomToLocation.zoomLevel !== config.zoomToLocation.zoomLevel ||
        this._prevZoomToLocation.expandCluster !== config.zoomToLocation.expandCluster

      if (hasChanged) {
        this._prevZoomToLocation = { ...config.zoomToLocation }

        // If expandCluster is true, find and expand the cluster at/near the coordinates
        if (config.zoomToLocation.expandCluster) {
          const cluster = this._findClusterAtCoordinates(config.zoomToLocation.coordinates)
          if (cluster) {
            this._expandCluster(cluster)
          }
        }

        this._zoomToLocation(config.zoomToLocation.coordinates, config.zoomToLocation.zoomLevel)
      }
    } else {
      this._prevZoomToLocation = undefined
    }

    // Run collision detection after initial render
    if (!this._isZooming) {
      this._runCollisionDetection()
    }
  }

  _renderBackground (): void {
    renderBackground(
      this._backgroundRect,
      this.bleed.left,
      this.bleed.top,
      () => this._collapseExpandedCluster()
    )
  }

  _renderGroups (duration: number): void {
    const transformString = this._transform.toString()
    smartTransition(this._featuresGroup, duration)
      .attr('transform', transformString)
      .attr('stroke-width', 1 / this._currentZoomLevel)

    smartTransition(this._areaLabelsGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._linksGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._clusterBackgroundGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._pointsGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._sourcePointsGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._flowParticlesGroup, duration)
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

      if (config.mapFitToPoints) {
        // Re-fit projection to points instead of full topojson
        this._fitToPoints()
      }

      // After initial fit (to features or points), treat the current projection
      // scale as the baseline for zoom level 1.
      this._initialScale = this._projection.scale()
      this._center = this._projection.translate()

      const zoomExtent = config.zoomExtent
      this._zoomBehavior.scaleExtent([zoomExtent[0] * this._initialScale, zoomExtent[1] * this._initialScale])
      this._currentZoomLevel = config.zoomFactor || 1
      this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', String(this._currentZoomLevel))

      if (!config.disableZoom) {
        this.g.call(this._zoomBehavior)
        this._applyZoom()
      }

      // Initialize transform for first render after applyZoom
      const scale = this._currentZoomLevel
      const center = this._projection.translate()
      this._transform = zoomIdentity
        .translate(this._center[0] - center[0] * scale, this._center[1] - center[1] * scale)
        .scale(scale)

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
    const featuresMerged = featuresEnter.merge(features)

    // Animate geometry changes, but apply fill immediately to avoid "delay then jump"
    smartTransition(featuresMerged, duration)
      .attr('d', this._path)
      .style('cursor', d => d.data ? getString(d.data, config.areaCursor) : null)

    // Set fill directly so color updates are instantaneous instead of snapping at the end of a transition
    featuresMerged.style('fill', (d, i) => d.data ? getColor(d.data, config.areaColor, i) : null)

    // Add click handler to collapse expanded cluster when clicking on map features
    featuresMerged.on('click', () => {
      this._collapseExpandedCluster()
    })

    features.exit().remove()
  }

  _renderAreaLabels (duration: number): void {
    const { config } = this

    // Early return if no area label configuration
    if (!config.areaLabel) {
      this._areaLabelsGroup.selectAll('*').remove()
      return
    }

    const featureData = (this._featureCollection?.features ?? []) as MapFeature<AreaDatum>[]

    // Prepare candidate labels with optimized filtering and calculations
    const candidateLabels = featureData
      .map(feature => {
        // Use area data if present, otherwise fall back to GeoJSON properties
        const areaDatum = feature.data || feature.properties
        const labelText = areaDatum ? getString(areaDatum as AreaDatum, config.areaLabel) : null
        if (!labelText) return null

        const centroid = this._path.centroid(feature)

        // Skip if centroid is invalid (e.g., for very small or complex shapes)
        if (!centroid || centroid.some(coord => !isFinite(coord))) return null

        const bounds = this._path.bounds(feature)
        const area = (bounds[1][0] - bounds[0][0]) * (bounds[1][1] - bounds[0][1])

        return {
          feature,
          centroid,
          area,
          labelText,
          id: feature.data ? getString(feature.data, config.areaId) : feature.id?.toString(),
        }
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.area - a.area) // Prioritize larger areas

    // D3 data binding with improved key function
    const labels = this._areaLabelsGroup
      .selectAll<SVGTextElement, typeof candidateLabels[0]>(`.${s.areaLabel}`)
      .data(candidateLabels, d => d.id || '')

    // Handle entering labels
    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', s.areaLabel)
      .attr('transform', d => `translate(${d.centroid[0]},${d.centroid[1]})`)
      .style('opacity', 0)
      .style('pointer-events', 'none')

    // Update all labels (enter + update)
    const labelsMerged = labelsEnter.merge(labels)
    labelsMerged
      .text(d => d.labelText)
      .attr('transform', d => `translate(${d.centroid[0]},${d.centroid[1]})`)
      .style('font-size', `calc(var(${s.variables.mapPointLabelFontSize}) / ${this._currentZoomLevel})`)
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'middle')

    // Handle exiting labels
    smartTransition(labels.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Only update opacity after zoom completes
    if (!this._isZooming) {
      smartTransition(labelsMerged, duration)
        .style('opacity', 1)
    }
  }

  _renderClusterBackground (duration: number): void {
    const { config } = this
    const currentZoomLevel = this._currentZoomLevel || 1

    // Always remove existing background circles first
    this._clusterBackgroundGroup.selectAll('circle').remove()

    if (this._expandedCluster && config.clusterBackground) {
      const cluster = this._expandedCluster.cluster
      const pos = this._projection(cluster.geometry.coordinates as [number, number])

      const backgroundRadius = getClusterRadius(this._expandedCluster as { points: PackedPoint[]; cluster: TopoJSONMapPoint<PointDatum> })
      // Divide by zoom level since the group transform will scale it back up
      const adjustedRadius = backgroundRadius / currentZoomLevel

      this._clusterBackgroundGroup
        .append('circle')
        .attr('class', s.clusterBackgroundCircle)
        .attr('cx', pos[0])
        .attr('cy', pos[1])
        .attr('r', 0)
        .style('fill', `var(${s.variables.mapClusterExpandedBackgroundFillColor})`)
        .style('opacity', 0)
        .style('cursor', 'pointer')
        .on('click', () => {
          this._collapseExpandedCluster()
        })
        .transition()
        .duration(duration)
        .attr('r', adjustedRadius)
        .style('opacity', 0.7)
    }
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

  private _shouldFilterPointOrCluster (point: TopoJSONMapPoint<PointDatum>, pointIdsToFilter: Set<string>): boolean {
    const { config } = this

    // If it's a cluster (potential subcluster), check if any of its leaves should be filtered
    if ((point.properties as TopoJSONMapClusterDatum<PointDatum>).cluster) {
      const clusterId = (point.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId
      const clusterLeaves = this._clusterIndex.getLeaves(clusterId, Infinity)
      // Filter out this subcluster if any of its leaves are in the filter set
      return clusterLeaves.some((leaf: PointFeature<PointDatum>) =>
        pointIdsToFilter.has(getString(leaf.properties as PointDatum, config.pointId))
      )
    }

    // For individual points, filter if they're in the filter set
    const pointId = getString(point.properties as PointDatum, config.pointId)
    return pointIdsToFilter.has(pointId)
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

    // Get bounds for clustering - [westLng, southLat, eastLng, northLat]
    // For now, use full world bounds since calculating viewport bounds with zoom transforms is complex
    const bounds: [number, number, number, number] = [-180, -90, 180, 90]

    // Use map zoom level directly for Supercluster, capped at SUPERCLUSTER_MAX_ZOOM.
    // Supercluster expects zoom 0-22; beyond that, all points are unclustered anyway.
    const mapZoom = this._currentZoomLevel || 1
    const zoom = Math.max(0, Math.min(Math.round(mapZoom), SUPERCLUSTER_MAX_ZOOM))
    let geoJsonPoints = getClustersAndPoints(this._clusterIndex!, bounds, zoom)

    // Handle expanded cluster points - replace the expanded cluster with individual points
    if (this._expandedCluster) {
      const expandedClusterId = (this._expandedCluster.cluster.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId

      // Remove the expanded cluster if it still exists at this zoom level
      geoJsonPoints = geoJsonPoints.filter((c) => {
        const props = c.properties as TopoJSONMapClusterDatum<PointDatum>
        const isExpandedCluster = props.cluster && props.clusterId === expandedClusterId
        return !isExpandedCluster
      })

      // Remove any individual points and subclusters that are part of the expanded cluster to avoid duplicates
      const expandedPointIds = new Set(this._expandedCluster.points.map(p => p.id.toString()))
      geoJsonPoints = geoJsonPoints.filter(c => !this._shouldFilterPointOrCluster(
        geoJsonPointToScreenPoint(
          c as ClusterFeature<TopoJSONMapClusterDatum<PointDatum>> | PointFeature<TopoJSONMapPointDatum<PointDatum>>,
          0,
          this._projection,
          this.config,
          this._currentZoomLevel || 1
        ),
        expandedPointIds
      ))

      // Add points from the expanded cluster
      geoJsonPoints = geoJsonPoints.concat(this._expandedCluster.points as unknown as Array<ClusterFeature<TopoJSONMapClusterDatum<PointDatum>> | PointFeature<PointDatum>>)
    }

    if (this._collapsedCluster) {
      // When collapsed, restore the original cluster point instead of relying on clustering algorithm
      const collapsedClusterId = this._collapsedCluster.properties.clusterId

      // Check if the clustering algorithm has recreated a similar cluster at this zoom level
      const hasNaturalCluster = geoJsonPoints.some(c => {
        const props = c.properties as TopoJSONMapClusterDatum<PointDatum>
        return props.cluster && props.clusterId === collapsedClusterId
      })

      if (hasNaturalCluster) {
        // Natural cluster exists, we can safely clear the collapsed cluster
        this._collapsedCluster = null
        this._collapsedClusterPointIds = null
      } else {
        // Remove any individual points and subclusters that were part of the collapsed cluster
        geoJsonPoints = geoJsonPoints.filter(c => !this._shouldFilterPointOrCluster(
          geoJsonPointToScreenPoint(
            c as ClusterFeature<TopoJSONMapClusterDatum<PointDatum>> | PointFeature<TopoJSONMapPointDatum<PointDatum>>,
            0,
            this._projection,
            this.config,
            this._currentZoomLevel || 1
          ),
          this._collapsedClusterPointIds
        ))

        // Add the original cluster back
        geoJsonPoints.push(this._collapsedCluster as unknown as ClusterFeature<TopoJSONMapClusterDatum<PointDatum>>)
      }
    }

    return geoJsonPoints.map((geoPoint, i) =>
      geoJsonPointToScreenPoint(
        geoPoint as ClusterFeature<TopoJSONMapClusterDatum<PointDatum>> | PointFeature<TopoJSONMapPointDatum<PointDatum>>,
        i,
        this._projection,
        this.config,
        this._currentZoomLevel || 1
      )
    )
  }

  _renderPoints (duration: number): void {
    const { config } = this
    const pointData = this._getPointData()
    const currentZoomLevel = this._currentZoomLevel || 1

    // Set z-index for expanded cluster points to ensure proper layering
    if (this._expandedCluster && config.clusterBackground) {
      pointData.forEach((d) => {
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        expandedPoint._zIndex = expandedPoint.expandedClusterPoint ? 2 : 0
      })
    }

    const points = this._pointsGroup
      .selectAll<SVGGElement, TopoJSONMapPoint<PointDatum>>(`.${s.point}`)
      .data(pointData, (d, i) => d.id?.toString() ?? `point-${i}`)


    // Enter
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .attr('transform', d => {
        const pos = this._projection(d.geometry.coordinates as [number, number])
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        // Divide by zoom level to compensate for the group's zoom transform
        const dx = (expandedPoint.dx ?? 0) / currentZoomLevel
        const dy = (expandedPoint.dy ?? 0) / currentZoomLevel
        return `translate(${pos[0] + dx},${pos[1] + dy})`
      })
      .style('opacity', 1e-6)

    // Main shape (circle, square, triangle) - always draw path; fill/stroke hide when donut shown (match leaflet)
    pointsEnter.append('path')
      .attr('class', s.pointShape)
      .attr('d', d => {
        const radius = d.radius / currentZoomLevel
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        return getPointPathData({ x: 0, y: 0 }, radius, shape)
      })
      .style('fill', (d) => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        if (shape === TopoJSONMapPointShape.Ring) return 'none'
        return d.color
      })
      .style('stroke', d => d.color)
      .style('stroke-width', d => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const baseStrokeWidth = isRing ? getNumber(d.properties as PointDatum, config.pointRingWidth) : getNumber(d.properties as PointDatum, config.pointStrokeWidth)
        return baseStrokeWidth / currentZoomLevel
      })

    // Donut group for color-map functionality
    const donutGroup = pointsEnter.append('g')
      .attr('class', d => d.isCluster ? s.clusterDonut : s.pointDonut)
      .attr('data-point-id', (d, i) => getString(d.properties as PointDatum, config.pointId, i))

    // Add background circle for clusters with donut data
    donutGroup.each(function (d) {
      if (d.isCluster && d.donutData.length > 0) {
        select(this).append('circle')
          .attr('class', s.clusterBackground)
          .attr('r', 0)
      }
    })

    // Ring overlay path for ring shape
    pointsEnter.append('path')
      .attr('class', s.pointPathRing)
      .attr('d', 'M0,0')
      .style('display', d => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape
        return shape === TopoJSONMapPointShape.Ring ? null : 'none'
      })

    // Center label (for cluster summary or point label)
    pointsEnter.append('text')
      .attr('class', s.pointLabel)
      .attr('dy', '0.32em')
      .style('opacity', 0)

    pointsEnter.append('text').attr('class', s.pointBottomLabel)
      .style('opacity', 0)

    // Update
    const pointsMerged = pointsEnter.merge(points)
    smartTransition(pointsMerged, duration)
      .attr('transform', d => {
        const pos = this._projection(d.geometry.coordinates as [number, number])
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        // Divide by zoom level to compensate for the group's zoom transform
        const dx = (expandedPoint.dx ?? 0) / currentZoomLevel
        const dy = (expandedPoint.dy ?? 0) / currentZoomLevel
        return `translate(${pos[0] + dx},${pos[1] + dy})`
      })
      .style('cursor', d => {
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        // Expanded cluster points use default cursor (clicking them does nothing)
        if (expandedPoint.expandedClusterPoint) {
          return getString(expandedPoint.properties as PointDatum, config.pointCursor) ?? 'default'
        }
        return d.isCluster ? 'pointer' : getString(d.properties as PointDatum, config.pointCursor)
      })
      .style('opacity', 1)

    // Add click event handler for clusters
    pointsMerged.on('click', (event: MouseEvent, d: TopoJSONMapPoint<PointDatum>) => {
      this._onPointClick(d, event)
    })

    // Update donut charts and cluster backgrounds (match leaflet: radius 0 when shape is non-circular)
    pointsMerged.selectAll<SVGGElement, TopoJSONMapPoint<PointDatum>>(`.${s.pointDonut}, .${s.clusterDonut}`).each(function (d) {
      const group = select(this as SVGGElement)
      const pointShape = getString(d.properties as PointDatum, config.pointShape)
      const isRing = pointShape === TopoJSONMapPointShape.Ring
      const isCircular = (pointShape === TopoJSONMapPointShape.Circle) || isRing || d.isCluster || !pointShape

      // Update or create background circle for clusters
      if (d.isCluster && d.donutData.length > 0) {
        const radius = d.radius / currentZoomLevel
        const bgCircle = group.select(`.${s.clusterBackground}`)

        if (bgCircle.empty()) {
          group.insert('circle', ':first-child')
            .attr('class', s.clusterBackground)
            .attr('r', radius)
        } else {
          bgCircle.attr('r', radius)
        }
      }

      // Update donut/pie chart: pass radius 0 when non-circular so donut is not drawn (shape takes priority)
      if (d.donutData.length > 0) {
        const radius = (isCircular ? d.radius : 0) / currentZoomLevel
        const arcWidth = d.isCluster ? (2 / currentZoomLevel) : (isCircular ? d.radius / currentZoomLevel : 0)
        const strokeWidth = 0.5 / currentZoomLevel
        updateDonut(group, d.donutData, radius, arcWidth, strokeWidth, 0.05)
      } else {
        group.selectAll('*').remove()
      }

      // Update the class attribute based on whether it's a cluster
      group.attr('class', d.isCluster ? s.clusterDonut : s.pointDonut)
    })

    // Update point shapes
    smartTransition(pointsMerged.select(`.${s.pointShape}`), duration)
      .attr('d', d => {
        const radius = d.radius / currentZoomLevel
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        return getPointPathData({ x: 0, y: 0 }, radius, shape)
      })
      .style('fill', d => {
        const pointShape = getString(d.properties as PointDatum, config.pointShape)
        const shape = pointShape as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const hasDonut = d.donutData.length > 0
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>

        // For expanded cluster points, use the preserved cluster color
        if (expandedPoint.expandedClusterPoint) {
          return expandedPoint.clusterColor || expandedPoint.expandedClusterPoint.color
        }

        if (isRing) return 'none'
        // Match leaflet: cluster with donut uses transparent background; otherwise path uses d.color (colorMap or pointColor)
        if (hasDonut && d.isCluster) return 'transparent'
        return d.color
      })
      .style('stroke', d => {
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        // For expanded cluster points, use the preserved cluster color
        if (expandedPoint.expandedClusterPoint) {
          return expandedPoint.clusterColor || expandedPoint.expandedClusterPoint.color
        }
        return d.color
      })
      .style('stroke-width', d => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const baseStrokeWidth = isRing ? getNumber(d.properties as PointDatum, config.pointRingWidth) : getNumber(d.properties as PointDatum, config.pointStrokeWidth)
        return baseStrokeWidth / currentZoomLevel
      })

    // Ring overlay update
    smartTransition(pointsMerged.select(`.${s.pointPathRing}`), duration)
      .attr('d', d => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape
        if (shape !== TopoJSONMapPointShape.Ring) return ''
        const radius = d.radius / currentZoomLevel
        return getPointPathData({ x: 0, y: 0 }, radius, TopoJSONMapPointShape.Circle)
      })
      .style('display', d => {
        const shape = getString(d.properties as PointDatum, config.pointShape) as TopoJSONMapPointShape
        return shape === TopoJSONMapPointShape.Ring ? null : 'none'
      })

    const pointLabelsMerged = pointsMerged.select(`.${s.pointLabel}`)
    pointLabelsMerged
      .text(d => {
        if (d.isCluster) {
          return getString(d.properties as TopoJSONMapClusterDatum<PointDatum>, config.clusterLabel) ?? ''
        }
        return getString(d.properties as PointOrClusterProperties<PointDatum>, config.pointLabel as StringAccessor<PointOrClusterProperties<PointDatum>>) ?? ''
      })
      .style('font-size', d => {
        if (config.pointLabelPosition === MapPointLabelPosition.Bottom) {
          return `calc(var(${s.variables.mapPointLabelFontSize}) / ${currentZoomLevel})`
        }
        const radius = d.isCluster
          ? (d.radius / currentZoomLevel)
          : getNumber(
            d.properties as PointOrClusterProperties<PointDatum>,
            config.pointRadius as NumericAccessor<PointOrClusterProperties<PointDatum>>,
            0
          ) / currentZoomLevel
        const pointLabelText = d.isCluster
          ? (getString(d.properties as TopoJSONMapClusterDatum<PointDatum>, config.clusterLabel) || '')
          : (getString(
            d.properties as PointOrClusterProperties<PointDatum>,
            config.pointLabel as StringAccessor<PointOrClusterProperties<PointDatum>>
          ) || '')
        const textLength = pointLabelText.length
        // Use the same formula as Leaflet map for consistent font sizing
        const fontSize = radius / Math.pow(textLength, 0.4)
        // Match Leaflet: minimum is the calculated fontSize itself, max is 16
        return clamp(fontSize, fontSize, 16)
      })
      .attr('y', d => {
        // For points with pie/donut charts, always center the label
        if (d.donutData.length > 0) return null

        if (config.pointLabelPosition === MapPointLabelPosition.Center) return null

        const radius = d.isCluster
          ? (d.radius / currentZoomLevel)
          : getNumber(
            d.properties as PointOrClusterProperties<PointDatum>,
            config.pointRadius as NumericAccessor<PointOrClusterProperties<PointDatum>>,
            0
          ) / currentZoomLevel
        return radius
      })
      .attr('dy', d => {
        // For points with pie/donut charts, always use centered dy
        if (d.donutData.length > 0) return '0.32em'
        return config.pointLabelPosition === MapPointLabelPosition.Center ? '0.32em' : '1em'
      })

    smartTransition(pointLabelsMerged, duration)
      .style('fill', (d, i) => {
        if (d.donutData.length > 0) {
          // Cluster background is white, so use dark text
          return d.isCluster
            ? `var(${s.variables.mapPointLabelTextColorDark})`
            : `var(${s.variables.mapPointLabelTextColorLight})`
        } else {
          if (config.pointLabelColor) {
            const labelColor = getColor(d.properties as PointDatum, config.pointLabelColor, i)
            if (labelColor) return labelColor
          }

          const pointColor = getColor(
            d.properties as PointOrClusterProperties<PointDatum>,
            config.pointColor as ColorAccessor<PointOrClusterProperties<PointDatum>>,
            i
          )
          const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
          if (!hex) return null

          const brightness = hexToBrightness(hex)
          return brightness > config.pointLabelTextBrightnessRatio
            ? `var(${s.variables.mapPointLabelTextColorDark})`
            : `var(${s.variables.mapPointLabelTextColorLight})`
        }
      })
      .style('opacity', 1)
      .style('pointer-events', 'none')
      .attr('visibility', d => {
        // Show labels for clusters, individual points with pie charts, and when pointLabel is defined
        const hasLabel = d.isCluster
          ? !!getString(d.properties as TopoJSONMapClusterDatum<PointDatum>, config.clusterLabel)
          : !!getString(
            d.properties as PointOrClusterProperties<PointDatum>,
            config.pointLabel as StringAccessor<PointOrClusterProperties<PointDatum>>
          )
        return hasLabel ? null : 'hidden'
      })

    // Point & cluster bottom labels (hidden when point is inside expanded cluster)
    const bottomLabelsMerged = pointsMerged.select(`.${s.pointBottomLabel}`)
    bottomLabelsMerged
      .attr('visibility', d => (d as ExpandedClusterPoint<PointDatum>).expandedClusterPoint ? 'hidden' : null)
      .text(d => {
        const bottomLabelText = d.isCluster
          ? (getString(d.properties as TopoJSONMapClusterDatum<PointDatum>, config.clusterBottomLabel) ?? '')
          : (getString(d.properties as PointDatum, config.pointBottomLabel) ?? '')
        return trimStringMiddle(bottomLabelText, 15)
      })
      .attr('y', d => {
        const radius = d.isCluster
          ? (d.radius / this._currentZoomLevel)
          : (getNumber(d.properties as PointDatum, config.pointRadius) / this._currentZoomLevel)
        return radius + (10 / this._currentZoomLevel) // offset below the point/cluster, scaled with zoom
      })
      .attr('dy', '0.32em')
      .style('font-size', `calc(var(${s.variables.mapPointBottomLabelFontSize}) / ${this._currentZoomLevel})`)

    smartTransition(bottomLabelsMerged, duration)
      .style('opacity', d => (d as ExpandedClusterPoint<PointDatum>).expandedClusterPoint ? 0 : 1)

    // Sort elements by z-index to ensure expanded cluster points appear above everything else
    if (this._expandedCluster && config.clusterBackground) {
      this._pointsGroup
        .selectAll<SVGGElement, TopoJSONMapPoint<PointDatum>>(`.${s.point}`)
        .sort((a: TopoJSONMapPoint<PointDatum>, b: TopoJSONMapPoint<PointDatum>) => a._zIndex - b._zIndex)
    }

    // Exit
    points.exit().remove()

    // Heatmap
    this._pointsGroup.style('filter', (config.heatmapMode && this._currentZoomLevel < config.heatmapModeZoomLevelThreshold) ? 'url(#heatmapFilter)' : null)
    this._pointsGroup.selectAll(`.${s.pointLabel}`).style('display', (config.heatmapMode && (this._currentZoomLevel < config.heatmapModeZoomLevelThreshold)) ? 'none' : null)
    this._pointsGroup.selectAll(`.${s.pointBottomLabel}`).style('display', (config.heatmapMode && (this._currentZoomLevel < config.heatmapModeZoomLevelThreshold)) ? 'none' : null)

    // Update selection ring
    updateSelectionRing<AreaDatum, PointDatum, LinkDatum>(
      this._pointSelectionRing,
      this._selectedPoint,
      pointData,
      this.config,
      this._projection,
      currentZoomLevel
    )

    // Set up events and custom attributes for rendered points (match LeafletMap behavior)
    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()
  }

  _fitToPoints (points?: PointDatum[], pad = 0.1): void {
    const { config, datamodel } = this
    const pointData = points || datamodel.points
    if (pointData.length === 0 && !(datamodel.data?.links?.length)) return

    const coordinates = pointData.map(p => [
      getNumber(p, d => getNumber(d, config.longitude)),
      getNumber(p, d => getNumber(d, config.latitude)),
    ] as [number, number]).filter(([lon, lat]) => isNumber(lon) && isNumber(lat))

    const rawLinks = datamodel.data?.links ?? []
    for (let i = 0; i < rawLinks.length; i += 1) {
      const link = rawLinks[i]
      const slon = getNumber(link, config.sourceLongitude, i)
      const slat = getNumber(link, config.sourceLatitude, i)
      const tlon = getNumber(link, config.targetLongitude, i)
      const tlat = getNumber(link, config.targetLatitude, i)
      if (isNumber(slon) && isNumber(slat)) coordinates.push([slon, slat])
      if (isNumber(tlon) && isNumber(tlat)) coordinates.push([tlon, tlat])
    }

    if (coordinates.length === 0) return

    if (coordinates.length === 1) {
      // Single point has zero-area bounds and breaks fitExtent; center the projection on the point
      this._projection.center(coordinates[0])
      this._projection.translate([this._width / 2, this._height / 2])
    } else {
      const featureCollection: ExtendedFeatureCollection = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: { type: 'MultiPoint', coordinates },
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
    }

    this._center = this._projection.translate()
  }

  _applyZoom (): void {
    const translate = this._center ?? this._projection.translate()
    const scale = this._initialScale * this._currentZoomLevel

    // Set an explicit pixel extent so D3 never falls back to defaultExtent2,
    // which reads SVGLength.baseVal.value and throws on SVGs with % dimensions.
    this._zoomBehavior.extent([[0, 0], [this._width, this._height]])

    this.g.call(this._zoomBehavior.transform, zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    this._isZooming = true
    this._onZoomEnd()
  }

  _onResize (): void {
    this._isResizing = true
    const prevTranslate = this._projection.translate()

    this._projection.fitExtent([[0, 0], [this._width, this._height]], this._featureCollection)
    this._initialScale = this._projection.scale()

    // If a point is selected, center the view on it after resize
    if (this._selectedPoint) {
      const coords = this._selectedPoint.geometry.coordinates as [number, number]
      const pos = this._projection(coords)
      const projTranslate = this._projection.translate()
      if (pos) {
        const k = this._currentZoomLevel
        this._center = [
          this._width / 2 - (pos[0] - projTranslate[0]) * k,
          this._height / 2 - (pos[1] - projTranslate[1]) * k,
        ]
      }
    } else {
      this._center = [
        this._projection.translate()[0] * this._center[0] / prevTranslate[0],
        this._projection.translate()[1] * this._center[1] / prevTranslate[1],
      ]
    }

    this._applyZoom()

    this._isResizing = false
    this._prevWidth = this._width
    this._prevHeight = this._height
  }

  _onZoom (event: D3ZoomEvent<SVGGElement, unknown>): void {
    if (this._firstRender) {
      // On first render, just update the zoom level, don't trigger animation
      this._currentZoomLevel = (event?.transform.k / this._initialScale) || 1
      // Set CSS custom property for zoom level
      this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', String(this._currentZoomLevel))
      return // To prevent double render because of binding zoom behaviour
    }
    const isMouseEvent = !!event.sourceEvent
    const isExternalEvent = !event?.sourceEvent && !this._isResizing
    const isResizeEvent = this._isResizing && !event?.sourceEvent

    this._isZooming = true

    // Clear any pending zoom end timeout
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }

    // Reset expanded cluster when manually zooming (but not during component-initiated zoom)
    if (isMouseEvent && !this._eventInitiatedByComponent) {
      this._resetExpandedCluster()
      // Also clear the collapsed cluster state so points can naturally re-cluster at the new zoom level
      this._collapsedCluster = null
      this._collapsedClusterPointIds = null
    }

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(this._onZoomHandler.bind(this, event.transform, isMouseEvent, isExternalEvent, isResizeEvent))

    if (isMouseEvent) {
      // Update the center coordinate so that the next call to _applyZoom()
      // will zoom with respect to the current view
      this._center = [event.transform.x, event.transform.y]
    }
    this._currentZoomLevel = (event?.transform.k / this._initialScale) || 1
    // Set CSS custom property for zoom level
    this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', String(this._currentZoomLevel))

    // Fallback timeout in case zoom end event doesn't fire
    this._onZoomEnd()
  }

  _onZoomEnd (): void {
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }

    this._zoomEndTimeoutId = setTimeout(() => {
      this._isZooming = false
      this._runCollisionDetection()
    }, 150)
  }

  private _runCollisionDetection (): void {
    window.cancelAnimationFrame(this._collisionDetectionAnimFrameId)
    this._collisionDetectionAnimFrameId = window.requestAnimationFrame(() => {
      const duration = this.config.duration
      // Run collision detection for area labels
      const areaLabels = this._areaLabelsGroup.selectAll<SVGTextElement, unknown>(`.${s.areaLabel}`)
      collideAreaLabels(areaLabels, duration)

      // Run collision detection for point bottom labels
      const pointBottomLabels = this._pointsGroup.selectAll<SVGTextElement, TopoJSONMapPoint<PointDatum>>(`.${s.point} .${s.pointBottomLabel}`)
      collidePointBottomLabels(pointBottomLabels, duration)
    })
  }

  _onZoomHandler (transform: ZoomTransform, isMouseEvent: boolean, isExternalEvent: boolean, isResizeEvent = false): void {
    const scale = transform.k / this._initialScale || 1
    const center = this._projection.translate()

    this._transform = zoomIdentity
      .translate(transform.x - center[0] * scale, transform.y - center[1] * scale)
      .scale(scale)

    const customDuration = (isExternalEvent || isResizeEvent)
      ? this.config.zoomDuration
      : (isMouseEvent ? 0 : null)

    // Call render functions that depend on this._transform
    this._renderGroups(customDuration)
    this._renderAreaLabels(customDuration)
    this._renderLinks(customDuration)
    this._renderClusterBackground(customDuration)
    this._renderPoints(customDuration)
    this._renderSourcePoints(customDuration)
  }

  public zoomIn (increment = 0.5): void {
    if (this._isZooming) return
    this._resetExpandedCluster()
    this.setZoom(this._currentZoomLevel + increment)
  }

  public zoomOut (increment = 0.5): void {
    if (this._isZooming) return
    this._resetExpandedCluster()
    this.setZoom(this._currentZoomLevel - increment)
  }

  public setZoom (zoomLevel: number): void {
    const { config } = this
    const newZoomLevel = clamp(zoomLevel, config.zoomExtent[0], config.zoomExtent[1])
    const currentK = this._initialScale * this._currentZoomLevel
    const newK = this._initialScale * newZoomLevel
    // Update _center so the viewport center stays fixed when zooming (avoids drift after pan)
    if (currentK > 0 && isFinite(currentK) && isFinite(newK)) {
      const ratio = newK / currentK
      this._center[0] = (this._width / 2 - this.bleed.left) * (1 - ratio) + this._center[0] * ratio
      this._center[1] = (this._height / 2 - this.bleed.top) * (1 - ratio) + this._center[1] * ratio
    }
    this._currentZoomLevel = newZoomLevel
    // Set CSS custom property for zoom level
    this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', String(this._currentZoomLevel))
    this._transform = zoomIdentity
      .translate(this._center[0] * (1 - this._currentZoomLevel), this._center[1] * (1 - this._currentZoomLevel))
      .scale(this._currentZoomLevel)
    // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
    // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
    // that the zoom state has changed
    this._applyZoom()
  }

  public fitView (): void {
    const { config } = this

    this._resetExpandedCluster()

    if (config.mapFitToPoints) {
      // When mapFitToPoints is enabled, fitView should refit the projection to the points
      // and reset the zoom level relative to that fitted scale.
      this._fitToPoints()
      // Treat the newly fitted scale as the baseline and reset zoom to 1
      this._initialScale = this._projection.scale()
      this._currentZoomLevel = 1
      this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', '1')
      this._center = this._projection.translate()
      this._applyZoom()
    } else {
      this._projection.fitExtent([[0, 0], [this._width, this._height]], this._featureCollection)
      this._currentZoomLevel = (this._projection?.scale() / this._initialScale) || 1
      // Set CSS custom property for zoom level
      this.g.node()?.parentElement?.style.setProperty('--vis-map-current-zoom-level', String(this._currentZoomLevel))
      this._center = this._projection.translate()
      // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
      // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
      // that the zoom state has changed
      this._applyZoom()
    }
  }

  private _initFlowFeatures (): void {
    initFlowFeatures<AreaDatum, PointDatum, LinkDatum>(
      this as unknown as FlowInitContext<AreaDatum, PointDatum, LinkDatum>
    )
  }

  private _renderSourcePoints (duration: number): void {
    const { config } = this

    const sourcePoints = this._sourcePointsGroup
      .selectAll<SVGCircleElement, { x: number; y: number; radius: number; color: string; flowData: LinkDatum }>(`.${s.sourcePoint}`)
      .data(this._sourcePoints, (d, i) => `${d.flowData}-${i}`)

    const sourcePointsEnter = sourcePoints.enter()
      .append('circle')
      .attr('class', s.sourcePoint)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius / this._currentZoomLevel)
      .style('fill', d => d.color)
      .style('stroke', d => d.color)
      .style('stroke-width', 0)
      .style('opacity', 0)
      .on('click', (event: MouseEvent, d) => {
        event.stopPropagation()
        config.onSourcePointClick?.(d.flowData, d.x, d.y, event)
      })
      .on('mouseenter', (event: MouseEvent, d) => {
        config.onSourcePointMouseEnter?.(d.flowData, d.x, d.y, event)
      })
      .on('mouseleave', (event: MouseEvent, d) => {
        config.onSourcePointMouseLeave?.(d.flowData, event)
      })

    smartTransition(sourcePointsEnter.merge(sourcePoints), duration)
      .attr('r', d => d.radius / this._currentZoomLevel)
      .style('opacity', 1)

    sourcePoints.exit().remove()
  }

  private _renderFlowParticles (duration: number): void {
    const flowParticles = this._flowParticlesGroup
      .selectAll<SVGCircleElement, FlowParticle>(`.${s.flowParticle}`)
      .data(this._flowParticles, d => d.id)

    const flowParticlesEnter = flowParticles.enter()
      .append('circle')
      .attr('class', s.flowParticle)
      .attr('r', 0)
      .style('opacity', 0)

    smartTransition(flowParticlesEnter.merge(flowParticles), duration)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius / (this._currentZoomLevel || 1))
      .style('fill', d => d.color)
      .style('opacity', 0.8)

    flowParticles.exit().remove()
  }

  private _startFlowAnimation (): void {
    if (this._animationId) return // Animation already running

    this._animateFlow()
  }

  private _animateFlow (): void {
    if (!this.config.enableFlowAnimation) return

    this._animationId = requestAnimationFrame(() => {
      this._updateFlowParticles()
      this._animateFlow() // Recursive call like LeafletFlowMap
    })
  }

  private _stopFlowAnimation (): void {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }
  }

  private _updateFlowParticles (): void {
    updateFlowParticles({
      _flowParticles: this._flowParticles as FlowParticle[],
      _currentZoomLevel: this._currentZoomLevel,
      _flowParticlesGroup: this._flowParticlesGroup,
    } as FlowUpdateContext)
  }

  private _onPointClick (d: TopoJSONMapPoint<PointDatum>, event: MouseEvent): void {
    const { config } = this
    event.stopPropagation()

    // Clicking on expanded cluster points does nothing - they stay expanded
    // (clicking outside on the map background will collapse them)
    const expandedPoint = d as ExpandedClusterPoint<PointDatum>
    if (expandedPoint.expandedClusterPoint) {
      return
    }

    if (d.isCluster && (d.properties as TopoJSONMapClusterDatum<PointDatum>).cluster) {
      const zoomLevel = this._currentZoomLevel || 1
      const coordinates = d.geometry.coordinates as [number, number]
      const zoomExtent = config.zoomExtent
      const zoomMax = zoomExtent?.[1] ?? 12

      if (config.clusterExpandOnClick) {
        // Zoom to cluster and expand in one action
        const newZoomLevel = getNextZoomLevelOnClusterClick(zoomLevel, zoomMax)
        this._expandCluster(d)
        this._zoomToLocation(coordinates, newZoomLevel)
      } else {
        // Just zoom to cluster without expanding
        const newZoomLevel = getNextZoomLevelOnClusterClick(zoomLevel, zoomMax)
        this._zoomToLocation(coordinates, newZoomLevel)
      }
    }
  }

  private _findClusterAtCoordinates (coordinates: [number, number]): TopoJSONMapPoint<PointDatum> | undefined {
    const pointData = this._getPointData()
    const [targetLon, targetLat] = coordinates

    // Find clusters and calculate their distance to the target coordinates
    const clusters = pointData.filter(p => p.isCluster)
    if (clusters.length === 0) return undefined

    // Find the cluster closest to the target coordinates
    let closestCluster: TopoJSONMapPoint<PointDatum> | undefined
    let minDistance = Infinity

    for (const cluster of clusters) {
      const [lon, lat] = cluster.geometry.coordinates as [number, number]
      const distance = Math.sqrt(Math.pow(lon - targetLon, 2) + Math.pow(lat - targetLat, 2))

      if (distance < minDistance) {
        minDistance = distance
        closestCluster = cluster
      }
    }

    return closestCluster
  }

  private _expandCluster (clusterPoint: TopoJSONMapPoint<PointDatum>): PointDatum[] | undefined {
    const { config } = this

    if (!clusterPoint.clusterIndex) {
      console.error('Cannot expand cluster - no clusterIndex!')
      return undefined
    }

    // Note: _collapsedCluster.id is numeric (e.g., 331), but clusterPoint.id is "cluster-331"
    if (this._collapsedCluster && `cluster-${this._collapsedCluster.id}` === clusterPoint.id) {
      this._collapsedCluster = null
      this._collapsedClusterPointIds = null
    }

    const padding = 1
    const clusterId = (clusterPoint.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId as number
    const points = clusterPoint.clusterIndex.getLeaves(clusterId, Infinity)

    // Determine packing zoom level. Cap at SUPERCLUSTER_MAX_ZOOM to avoid huge radii when
    // zoomExtent[1] is large (e.g. 1000), which would cause incorrect expansion and weird animation.
    const maxClusterZoomLevel = Array.isArray(config.zoomExtent) ? Math.min(config.zoomExtent[1], SUPERCLUSTER_MAX_ZOOM) : 16
    const packingZoomLevel = Math.min(this._currentZoomLevel || 1, maxClusterZoomLevel)

    const packPoints: {x: number | null; y: number | null; r: number }[] = points.map((point) => {
      return {
        x: null as number | null,
        y: null as number | null,
        r: getPointRadius(point as PointFeature<TopoJSONMapPointDatum<PointDatum>>, config.pointRadius, packingZoomLevel) + padding,
      }
    })
    packSiblings(packPoints)

    // Create expanded points with relative positions
    const expandedPoints = points.map((point, i) => {
      const originalData = point.properties as PointDatum
      const radius = getNumber(originalData, config.pointRadius) || 8
      const shape = getString(originalData, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
      // Don't show pie charts for expanded cluster points (similar to Leaflet map)
      const donutData: TopoJSONMapPieDatum[] = []
      // Use each point's own color (from colorMap or pointColor) so shapes keep their correct color when expanded
      const explicitPointColor = getColor(originalData, config.pointColor)
      const pointDonutData = getDonutData(originalData, config.colorMap)
      const maxVal = pointDonutData.length ? Math.max(...pointDonutData.map(d => d.value)) : 0
      const biggestDatum = pointDonutData.find(d => d.value === maxVal) || pointDonutData[0]
      const pointColor = explicitPointColor ?? biggestDatum?.color ?? clusterPoint.color

      return {
        geometry: { type: 'Point' as const, coordinates: clusterPoint.geometry.coordinates },
        bbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
        radius,
        path: getPointPathData({ x: 0, y: 0 }, radius, shape),
        color: pointColor,
        id: getString(originalData, config.pointId, i) || `${clusterId}-${i}`,
        properties: originalData,
        donutData,
        isCluster: false,
        _zIndex: 1,
        expandedClusterPoint: clusterPoint,
        clusterColor: pointColor,
        dx: packPoints[i].x,
        dy: packPoints[i].y,
        packedRadius: packPoints[i].r, // Store the packed radius for cluster background calculation
      } as TopoJSONMapPoint<PointDatum> & { expandedClusterPoint: TopoJSONMapPoint<PointDatum>; dx: number; dy: number; packedRadius: number }
    })

    this._resetExpandedCluster()
    this._expandedCluster = {
      cluster: clusterPoint,
      points: expandedPoints,
    }

    // Re-render to show expanded points and cluster background with smooth animation
    this._renderClusterBackground(config.duration / 2)
    this._renderPoints(config.duration / 2)

    // Re-bind user-defined events to include newly created expanded cluster points
    this._setUpComponentEventsThrottled()
    this._setCustomAttributesThrottled()

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
    const currentCenter = this._projection.translate()
    const x = centerX + (currentCenter[0] - targetPoint[0]) * (k / this._initialScale)
    const y = centerY + (currentCenter[1] - targetPoint[1]) * (k / this._initialScale)

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
      .on('end', () => {
        // Reset the flag after transition completes
        this._eventInitiatedByComponent = false
      })
  }

  private _collapseExpandedCluster (): void {
    if (this._expandedCluster) {
      this._resetExpandedCluster()
      this._renderClusterBackground(this.config.duration)
      this._renderPoints(this.config.duration)
    }
  }

  private _resetExpandedCluster (): void {
    if (this._expandedCluster) {
      // Store the original cluster to restore it
      const originalCluster = this._expandedCluster.cluster
      const expandedPointIds = new Set(this._expandedCluster.points.map((p: TopoJSONMapPoint<PointDatum>) => getString(p.properties as PointDatum, this.config.pointId)))

      // Convert the original cluster back to GeoJSON format for re-insertion
      // Preserve critical fields: id (for cluster identification), clusterIndex (for re-expansion)
      const clusterGeoJson = {
        type: 'Feature' as const,
        id: (originalCluster.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId, // Use clusterId as the feature id
        properties: {
          ...originalCluster.properties,
          clusterIndex: originalCluster.clusterIndex, // Preserve clusterIndex for re-expansion
        },
        geometry: originalCluster.geometry,
      }

      this._collapsedCluster = clusterGeoJson
      this._collapsedClusterPointIds = expandedPointIds

      // Clean up all references to prevent memory leaks
      this._expandedCluster.points?.forEach((d) => {
        const expandedPoint = d as ExpandedClusterPoint<PointDatum>
        delete expandedPoint.expandedClusterPoint
        delete expandedPoint.clusterColor
        delete expandedPoint.dx
        delete expandedPoint.dy
      })
      this._expandedCluster = null
    }
  }

  /** Select a point by id */
  public selectPointById (id: string): void {
    const { config } = this
    const pointData = this._getPointData()
    const foundPoint = pointData.find(d => getString(d.properties as PointDatum, config.pointId) === id)

    if (foundPoint) {
      this._selectedPoint = foundPoint
      this._renderPoints(config.duration)
    } else {
      console.warn(`Unovis | TopoJSON Map: Point with id ${id} not found`)
    }
  }

  /** Get the id of the selected point */
  public getSelectedPointId (): string | number | undefined {
    return this._selectedPoint?.id
  }

  /** Unselect point */
  public unselectPoint (): void {
    this._selectedPoint = null
    this._renderPoints(this.config.duration)
  }

  destroy (): void {
    window.cancelAnimationFrame(this._animFrameId)
    this._stopFlowAnimation()
    window.cancelAnimationFrame(this._collisionDetectionAnimFrameId)
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }
  }
}
