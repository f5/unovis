import { Selection, select } from 'd3-selection'
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { timeout } from 'd3-timer'
import { easeCubicInOut } from 'd3-ease'
import { geoPath, GeoProjection, ExtendedFeatureCollection } from 'd3-geo'
import { color } from 'd3-color'

import { feature } from 'topojson-client'
import Supercluster from 'supercluster'

// Core
import { ComponentCore } from 'core/component'
import { MapGraphDataModel } from 'data-models/map-graph'

// Utils
import { clamp, getNumber, getString, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor, hexToBrightness } from 'utils/color'
import { getCSSVariableValue, isStringCSSVariable, rectIntersect } from 'utils/misc'
import { estimateStringPixelLength } from 'utils/text'

// Types
import { MapLink } from 'types/map'
import { Rect } from 'types/misc'

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
  FlowParticle,
  FlowSourcePoint,
} from './types'

// Config
import { TopoJSONMapDefaultConfig, TopoJSONMapConfigInterface } from './config'

// Modules
import { arc, getLonLat, getDonutData, getPointPathData, calculateClusterIndex, getNextZoomLevelOnClusterClick } from './utils'
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
  private _collideLabelsAnimFrameId: ReturnType<typeof requestAnimationFrame>

  private _featureCollection: GeoJSON.FeatureCollection
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown> = zoom()
  private _backgroundRect = this.g.append('rect').attr('class', s.background)
  private _featuresGroup = this.g.append('g').attr('class', s.features)
  private _areaLabelsGroup = this.g.append('g').attr('class', s.areaLabel)
  private _linksGroup = this.g.append('g').attr('class', s.links)
  private _pointsGroup = this.g.append('g').attr('class', s.points)

  // Flow-related properties
  private _flowParticlesGroup = this.g.append('g').attr('class', s.flowParticles)
  private _sourcePointsGroup = this.g.append('g').attr('class', s.sourcePoints)
  private _flowParticles: any[] = []
  private _sourcePoints: any[] = []
  private _animationId: number | null = null

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
    this._renderAreaLabels(duration)
    this._renderGroups(duration)
    this._renderLinks(duration)
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

    smartTransition(this._areaLabelsGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._linksGroup, duration)
      .attr('transform', transformString)

    smartTransition(this._pointsGroup, duration)
      .attr('transform', transformString)

    // Flow groups
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
        // Get label text from user-provided area data only
        const labelText = feature.data ? getString(feature.data, config.areaLabel) : null
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
      .style('font-size', `calc(var(--vis-map-point-label-font-size) / ${this._currentZoomLevel})`)
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'middle')

    // Handle exiting labels
    smartTransition(labels.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Run collision detection immediately to prevent flickering during zoom
    if (candidateLabels.length > 0) {
      window.cancelAnimationFrame(this._collideLabelsAnimFrameId)
      // Run collision detection synchronously first
      this._collideLabels()

      // Then schedule follow-up collision detection for any dynamic changes
      this._collideLabelsAnimFrameId = window.requestAnimationFrame(() => {
        this._collideLabels()
      })
    }

    // Animate to visible state AFTER collision detection
    smartTransition(labelsMerged, duration)
      .style('opacity', 1)
  }

  private _collideLabels (): void {
    const labels = this._areaLabelsGroup.selectAll<SVGTextElement, any>(`.${s.areaLabel}`)
    const labelNodes = labels.nodes()
    const labelData = labels.data()

    if (labelNodes.length === 0) return

    // Reset all labels to visible and mark them as such
    labelNodes.forEach((node: any) => {
      node._labelVisible = true
    })

    // Helper function to get bounding box
    const getBBox = (labelData: any): Rect => {
      const [x, y] = labelData.centroid
      const labelText = labelData.labelText || ''
      const fontSize = 12 // Default font size

      const width = estimateStringPixelLength(labelText, fontSize, 0.6)
      const height = fontSize * 1.2 // Line height factor

      return {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
      }
    }

    // Run collision detection similar to scatter plot
    labelNodes.forEach((node1: any, i) => {
      const data1 = labelData[i]
      if (!node1._labelVisible) return

      const label1BoundingRect = getBBox(data1)

      for (let j = 0; j < labelNodes.length; j++) {
        if (i === j) continue

        const node2 = labelNodes[j] as any
        const data2 = labelData[j]

        if (!node2._labelVisible) continue

        const label2BoundingRect = getBBox(data2)
        const intersect = rectIntersect(label1BoundingRect, label2BoundingRect, 2)

        if (intersect) {
          // Priority based on area size - larger areas keep their labels
          if (data1.area >= data2.area) {
            node2._labelVisible = false
          } else {
            node1._labelVisible = false
            break
          }
        }
      }
    })

    // Apply visibility based on collision detection
    labels.style('opacity', (d, i) => (labelNodes[i] as any)._labelVisible ? 1 : 0)
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

    if (!config.clustering || !this._clusterIndex || config.clusteringDistance === 0) {
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

    // Convert all points to screen space first
    const allPoints = datamodel.points.map((d, i) => {
      const coords = getLonLat(d, config.longitude, config.latitude)
      const screenPos = this._projection(coords)
      const radius = getNumber(d, config.pointRadius)
      const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
      const donutData = getDonutData(d, config.colorMap)
      const pointColor = getColor(d, config.pointColor, i)

      return {
        geometry: { type: 'Point', coordinates: coords },
        bbox: { x1: screenPos[0] - radius, y1: screenPos[1] - radius, x2: screenPos[0] + radius, y2: screenPos[1] + radius },
        radius,
        path: getPointPathData({ x: 0, y: 0 }, radius, shape),
        color: pointColor,
        id: getString(d, config.pointId, i),
        properties: d as TopoJSONMapPointDatum<PointDatum>,
        donutData,
        isCluster: false,
        _zIndex: 0,
        screenX: screenPos[0],
        screenY: screenPos[1],
        originalData: d,
      }
    })

    // Perform clustering in screen space
    let geoJsonPoints = this._clusterInScreenSpace(allPoints)

    // Handle expanded cluster points - replace the expanded cluster with individual points
    if (this._expandedCluster) {
      // Remove expanded cluster from the data
      geoJsonPoints = geoJsonPoints.filter((c: any) => c.properties.clusterId !== (this._expandedCluster?.cluster.properties as any).clusterId)
      // Add points from the expanded cluster
      geoJsonPoints = geoJsonPoints.concat(this._expandedCluster.points as any)
    }

    return geoJsonPoints as any
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
      .text(d => {
        if (d.isCluster) {
          // Use cluster label for clusters
          return getString(d as any, config.clusterLabel) ?? ''
        } else {
          // Use point label for regular points
          return getString(d.properties as any, config.pointLabel) ?? ''
        }
      })
      .style('font-size', d => {
        if (config.pointLabelPosition === MapPointLabelPosition.Bottom) {
          return `calc(var(--vis-map-point-label-font-size) / ${this._currentZoomLevel}`
        }
        const pointDiameter = 2 * getNumber(d.properties as any, config.pointRadius, 0)
        const pointLabelText = d.isCluster
          ? (getString(d as any, config.clusterLabel) || '')
          : (getString(d.properties as any, config.pointLabel) || '')
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

        if (d.isCluster) {
          // For clusters, use contrasting color against cluster background
          const clusterColor = getColor(d as any, config.clusterColor) || '#2196F3'
          const hex = color(isStringCSSVariable(clusterColor) ? getCSSVariableValue(clusterColor, this.element) : clusterColor)?.hex()
          if (hex) {
            const brightness = hexToBrightness(hex)
            return brightness > 0.5 ? '#333' : '#fff'
          }
          return '#fff'
        } else {
          // Regular point label color logic
          const pointColor = getColor(d.properties as any, config.pointColor, i)
          const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
          if (!hex) return null

          const brightness = hexToBrightness(hex)
          return brightness > config.pointLabelTextBrightnessRatio ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
        }
      })
      .style('font-weight', d => d.isCluster ? 'bold' : 'normal')
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
    // _currentZoomLevel is now set in _onZoomHandler to track previous value
  }

  _onZoomHandler (transform: ZoomTransform, isMouseEvent: boolean, isExternalEvent: boolean): void {
    const scale = transform.k / this._initialScale || 1
    const center = this._projection.translate()

    this._transform = zoomIdentity
      .translate(transform.x - center[0] * scale, transform.y - center[1] * scale)
      .scale(scale)

    // Update zoom level for clustering calculations
    this._currentZoomLevel = (transform.k / this._initialScale) || 1

    const customDuration = isExternalEvent
      ? this.config.zoomDuration
      : (isMouseEvent ? 0 : null)

    // Call render functions that depend on this._transform
    this._renderGroups(customDuration)
    this._renderAreaLabels(customDuration)
    this._renderLinks(customDuration)
    this._renderPoints(customDuration)

    // Update flow features on zoom
    if (this.config.enableFlowAnimation) {
      this._renderSourcePoints(customDuration)
      this._renderFlowParticles(customDuration)
    }

    // Update flow features on zoom
    if (this.config.enableFlowAnimation) {
      this._renderSourcePoints(customDuration)
      this._renderFlowParticles(customDuration)
    }
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

  public fitViewToFlows (pad = 0.1): void {
    const { config, datamodel } = this
    const points: PointDatum[] = [...(datamodel.points || [])]
    const links = datamodel.links || []

    // Add flow endpoints to the points to consider for fitting
    links.forEach((link) => {
      // Try to get source point
      if (config.sourceLongitude && config.sourceLatitude) {
        const sourceLon = getNumber(link, config.sourceLongitude)
        const sourceLat = getNumber(link, config.sourceLatitude)
        if (isNumber(sourceLon) && isNumber(sourceLat)) {
          points.push({ longitude: sourceLon, latitude: sourceLat } as unknown as PointDatum)
        }
      } else {
        const sourcePoint = config.linkSource?.(link)
        if (typeof sourcePoint === 'object' && sourcePoint !== null) {
          points.push(sourcePoint as PointDatum)
        }
      }

      // Try to get target point
      if (config.targetLongitude && config.targetLatitude) {
        const targetLon = getNumber(link, config.targetLongitude)
        const targetLat = getNumber(link, config.targetLatitude)
        if (isNumber(targetLon) && isNumber(targetLat)) {
          points.push({ longitude: targetLon, latitude: targetLat } as unknown as PointDatum)
        }
      } else {
        const targetPoint = config.linkTarget?.(link)
        if (typeof targetPoint === 'object' && targetPoint !== null) {
          points.push(targetPoint as PointDatum)
        }
      }
    })

    if (points.length > 0) {
      this._fitToPoints(points, pad)
    } else {
      this.fitView()
    }
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

  private _clusterInScreenSpace (points: any[]): any[] {
    const { config } = this
    const clusteringDistance = config.clusteringDistance || 55

    // If clustering distance is 0, return all points as individual points
    if (clusteringDistance === 0) {
      return points
    }

    const clusters: any[] = []
    const processed = new Set<number>()

    for (let i = 0; i < points.length; i++) {
      if (processed.has(i)) continue

      const point = points[i]
      const nearbyPoints = [point]
      processed.add(i)

      // Find all points within clustering distance
      for (let j = i + 1; j < points.length; j++) {
        if (processed.has(j)) continue

        const otherPoint = points[j]
        const distance = Math.sqrt(
          Math.pow(point.screenX - otherPoint.screenX, 2) +
          Math.pow(point.screenY - otherPoint.screenY, 2)
        )

        if (distance <= clusteringDistance) {
          nearbyPoints.push(otherPoint)
          processed.add(j)
        }
      }

      if (nearbyPoints.length > 1) {
        // Create cluster
        const centerX = nearbyPoints.reduce((sum, p) => sum + p.screenX, 0) / nearbyPoints.length
        const centerY = nearbyPoints.reduce((sum, p) => sum + p.screenY, 0) / nearbyPoints.length
        const centerCoords = this._projection.invert ? this._projection.invert([centerX, centerY]) : [0, 0]

        const clusterRadius = getNumber(nearbyPoints[0].originalData, config.clusterRadius) || 10
        const clusterId = clusters.length
        const cluster = {
          geometry: { type: 'Point', coordinates: centerCoords },
          properties: {
            cluster: true,
            clusterId: clusterId,
            pointCount: nearbyPoints.length,
            clusterPoints: nearbyPoints.map(p => p.originalData),
          } as TopoJSONMapClusterDatum<PointDatum>,
          bbox: { x1: centerX - clusterRadius, y1: centerY - clusterRadius, x2: centerX + clusterRadius, y2: centerY + clusterRadius },
          radius: clusterRadius,
          path: getPointPathData({ x: 0, y: 0 }, clusterRadius, TopoJSONMapPointShape.Circle),
          color: getColor(nearbyPoints[0].originalData, config.clusterColor) || '#2196F3',
          id: `cluster-${clusterId}`,
          donutData: [] as any[],
          isCluster: true,
          _zIndex: 1,
          clusterIndex: {
            getLeaves: (id: number) => {
              if (id === clusterId) {
                return nearbyPoints.map(p => ({ properties: p.originalData }))
              }
              return []
            },
          },
        }

        clusters.push(cluster)
      } else {
        // Keep as individual point
        clusters.push(point)
      }
    }

    return clusters
  }

  private _expandCluster (clusterPoint: TopoJSONMapPoint<PointDatum>): PointDatum[] | undefined {
    const { config } = this

    if (!clusterPoint.clusterIndex) return undefined

    const clusterId = (clusterPoint.properties as TopoJSONMapClusterDatum<PointDatum>).clusterId as number
    const points = clusterPoint.clusterIndex.getLeaves(clusterId, Infinity)

    // Create expanded points at their actual geographic coordinates
    const expandedPoints = points.map((point, i) => {
      const originalData = point.properties as PointDatum
      const coords = getLonLat(originalData, config.longitude, config.latitude)
      const pos = this._projection(coords)
      const radius = getNumber(originalData, config.pointRadius) || 8
      const shape = getString(originalData, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
      const donutData = getDonutData(originalData, config.colorMap)
      // Use individual point color based on its own data
      const pointColor = getColor(originalData, config.pointColor, i)

      return {
        geometry: { type: 'Point' as const, coordinates: coords },
        bbox: { x1: pos[0] - radius, y1: pos[1] - radius, x2: pos[0] + radius, y2: pos[1] + radius },
        radius,
        path: getPointPathData({ x: 0, y: 0 }, radius, shape),
        color: pointColor,
        id: getString(originalData, config.pointId, i),
        properties: originalData,
        donutData,
        isCluster: false,
        _zIndex: 1,
        expandedClusterPoint: clusterPoint,
        dx: 0, // No offset needed since using actual coordinates
        dy: 0,
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

  private _initFlowFeatures (): void {
    const { config, datamodel } = this
    // Use raw links data instead of processed links to avoid point lookup issues for flows
    const rawLinks = datamodel.data?.links || []

    // Clear existing flow data
    this._flowParticles = []
    this._sourcePoints = []

    if (!rawLinks || rawLinks.length === 0) return

    // Create source points and flow particles for each link
    rawLinks.forEach((link, i) => {
      // Try to get coordinates from flow-specific accessors first, then fall back to link endpoints
      let sourceLon: number, sourceLat: number, targetLon: number, targetLat: number

      if (config.sourceLongitude && config.sourceLatitude) {
        sourceLon = getNumber(link, config.sourceLongitude)
        sourceLat = getNumber(link, config.sourceLatitude)
      } else {
        // Fall back to using linkSource point coordinates
        const sourcePoint = config.linkSource?.(link)
        if (typeof sourcePoint === 'object' && sourcePoint !== null) {
          sourceLon = getNumber(sourcePoint as PointDatum, config.longitude)
          sourceLat = getNumber(sourcePoint as PointDatum, config.latitude)
        } else {
          return // Skip if can't resolve source coordinates
        }
      }

      if (config.targetLongitude && config.targetLatitude) {
        targetLon = getNumber(link, config.targetLongitude)
        targetLat = getNumber(link, config.targetLatitude)
      } else {
        // Fall back to using linkTarget point coordinates
        const targetPoint = config.linkTarget?.(link)
        if (typeof targetPoint === 'object' && targetPoint !== null) {
          targetLon = getNumber(targetPoint as PointDatum, config.longitude)
          targetLat = getNumber(targetPoint as PointDatum, config.latitude)
        } else {
          return // Skip if can't resolve target coordinates
        }
      }

      if (!isNumber(sourceLon) || !isNumber(sourceLat) || !isNumber(targetLon) || !isNumber(targetLat)) {
        return
      }

      const source = { lat: sourceLat, lon: sourceLon }
      const target = { lat: targetLat, lon: targetLon }

      // Create source point
      const sourcePos = this._projection([sourceLon, sourceLat])
      if (sourcePos) {
        const sourcePoint: FlowSourcePoint = {
          lat: sourceLat,
          lon: sourceLon,
          x: sourcePos[0],
          y: sourcePos[1],
          radius: getNumber(link, config.sourcePointRadius),
          color: getColor(link, config.sourcePointColor, i),
          flowData: link,
        }
        this._sourcePoints.push(sourcePoint)
      }

      // Create flow particles
      const dist = Math.sqrt((targetLat - sourceLat) ** 2 + (targetLon - sourceLon) ** 2)
      const numParticles = Math.max(1, Math.round(dist * getNumber(link, config.flowParticleDensity)))
      const velocity = getNumber(link, config.flowParticleSpeed)
      const radius = getNumber(link, config.flowParticleRadius)
      const color = getColor(link, config.flowParticleColor, i)

      for (let j = 0; j < numParticles; j += 1) {
        const progress = j / numParticles
        const location = {
          lat: sourceLat + (targetLat - sourceLat) * progress,
          lon: sourceLon + (targetLon - sourceLon) * progress,
        }

        const pos = this._projection([location.lon, location.lat])
        if (pos) {
          const particle: FlowParticle = {
            x: pos[0],
            y: pos[1],
            source,
            target,
            location,
            velocity,
            radius,
            color,
            flowData: link,
            progress: 0, // Keep for compatibility but not used in angle-based movement
            id: `${(link as any).id || i}-${j}`,
          }
          this._flowParticles.push(particle)
        }
      }
    })
  }

  private _renderSourcePoints (duration: number): void {
    const { config } = this

    const sourcePoints = this._sourcePointsGroup
      .selectAll<SVGCircleElement, FlowSourcePoint>(`.${s.sourcePoint}`)
      .data(this._sourcePoints, (d, i) => `${d.flowData}-${i}`)

    const sourcePointsEnter = sourcePoints.enter()
      .append('circle')
      .attr('class', s.sourcePoint)
      .attr('r', 0)
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
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius / (this._currentZoomLevel || 1))
      .style('fill', d => d.color)
      .style('stroke', d => d.color)
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
    if (this._flowParticles.length === 0) return

    const zoomLevel = this._currentZoomLevel || 1

    this._flowParticles.forEach(particle => {
      const { source, target } = particle

      // Calculate movement using angle-based velocity (like LeafletFlowMap)
      const fullDist = Math.sqrt((target.lat - source.lat) ** 2 + (target.lon - source.lon) ** 2)
      const remainedDist = Math.sqrt((target.lat - particle.location.lat) ** 2 + (target.lon - particle.location.lon) ** 2)
      const angle = Math.atan2(target.lat - source.lat, target.lon - source.lon)

      // Update geographic location
      particle.location.lat += particle.velocity * Math.sin(angle)
      particle.location.lon += particle.velocity * Math.cos(angle)

      // Reset to start when reaching target (like LeafletFlowMap)
      if (
        (((target.lat > source.lat) && (particle.location.lat > target.lat)) || ((target.lon > source.lon) && (particle.location.lon > target.lon))) ||
        (((target.lat < source.lat) && (particle.location.lat < target.lat)) || ((target.lon < source.lon) && (particle.location.lon < target.lon)))
      ) {
        particle.location.lat = source.lat
        particle.location.lon = source.lon
      }

      // Project to screen coordinates
      const pos = this._projection([particle.location.lon, particle.location.lat])
      if (pos) {
        // Add orthogonal arc shift (adapted from LeafletFlowMap)
        const orthogonalArcShift = -(zoomLevel ** 2 * fullDist / 8) * Math.cos(Math.PI / 2 * (fullDist / 2 - remainedDist) / (fullDist / 2)) || 0
        particle.x = pos[0]
        particle.y = pos[1] + orthogonalArcShift
      }
    })

    // Update DOM elements directly without data rebinding (for performance)
    this._flowParticlesGroup
      .selectAll<SVGCircleElement, any>(`.${s.flowParticle}`)
      .attr('cx', (d, i) => this._flowParticles[i]?.x || 0)
      .attr('cy', (d, i) => this._flowParticles[i]?.y || 0)
      .attr('r', (d, i) => (this._flowParticles[i]?.radius || 1) / zoomLevel)
  }

  destroy (): void {
    window.cancelAnimationFrame(this._animFrameId)
    this._stopFlowAnimation()
    window.cancelAnimationFrame(this._collideLabelsAnimFrameId)
  }
}
