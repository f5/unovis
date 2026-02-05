import { Selection } from 'd3-selection'
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3-zoom'
import { timeout } from 'd3-timer'
import { geoPath, GeoProjection, ExtendedFeatureCollection } from 'd3-geo'
import { color } from 'd3-color'
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

// Local Types
import { MapData, MapFeature, MapProjection, TopoJSONMapPointShape, FlowParticle } from './types'

// Config
import { TopoJSONMapDefaultConfig, TopoJSONMapConfigInterface } from './config'

// Modules
import { arc, getLonLat, getPointPathData, collideAreaLabels } from './utils'

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
  private _isZooming = false
  private _zoomEndTimeoutId: ReturnType<typeof setTimeout>
  private _collisionDetectionAnimFrameId: ReturnType<typeof requestAnimationFrame>

  private _featureCollection: GeoJSON.FeatureCollection
  private _zoomBehavior: ZoomBehavior<SVGGElement, unknown> = zoom()
  private _backgroundRect = this.g.append('rect').attr('class', s.background)
  private _featuresGroup = this.g.append('g').attr('class', s.features)
  private _areaLabelsGroup = this.g.append('g').attr('class', s.areaLabel)
  private _linksGroup = this.g.append('g').attr('class', s.links)
  private _pointsGroup = this.g.append('g').attr('class', s.points)

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

    // Run collision detection after initial render
    if (!this._isZooming) {
      this._runCollisionDetection()
    }
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

    // Only update opacity after zoom completes
    if (!this._isZooming) {
      smartTransition(labelsMerged, duration)
        .style('opacity', 1)
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

  _renderPoints (duration: number): void {
    const { config, datamodel } = this
    const pointData = datamodel.points

    const points = this._pointsGroup
      .selectAll<SVGGElement, PointDatum>(`.${s.point}`)
      .data(pointData, (d, i) => getString(d, config.pointId, i))

    // Enter
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .attr('transform', d => {
        const pos = this._projection(getLonLat(d, config.longitude, config.latitude))
        return `translate(${pos[0]},${pos[1]})`
      })
      .style('opacity', 0)

    // Main shape (circle, square, triangle)
    pointsEnter.append('path')
      .attr('class', s.pointShape)
      .attr('d', 'M0,0')
      .style('fill', (d, i) => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        if (shape === TopoJSONMapPointShape.Ring) return 'none'
        return getColor(d, config.pointColor, i)
      })
      .style('stroke-width', d => getNumber(d, config.pointStrokeWidth))

    // Ring overlay path for ring shape
    pointsEnter.append('path')
      .attr('class', s.pointPathRing)
      .attr('d', 'M0,0')
      .style('display', d => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape
        return shape === TopoJSONMapPointShape.Ring ? null : 'none'
      })

    pointsEnter.append('text').attr('class', s.pointLabel)
      .style('opacity', 0)

    pointsEnter.append('text').attr('class', s.pointBottomLabel)
      .style('opacity', 0)

    // Update
    const pointsMerged = pointsEnter.merge(points)
    smartTransition(pointsMerged, duration)
      .attr('transform', d => {
        const pos = this._projection(getLonLat(d, config.longitude, config.latitude))
        return `translate(${pos[0]},${pos[1]})`
      })
      .style('cursor', d => getString(d, config.pointCursor))
      .style('opacity', 1)

    // Main shape update
    smartTransition(pointsMerged.select(`.${s.pointShape}`), duration)
      .attr('r', d => getNumber(d, config.pointRadius) / this._currentZoomLevel)
      .style('fill', (d, i) => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        if (shape === TopoJSONMapPointShape.Ring) return 'none'
        return getColor(d, config.pointColor, i)
      })
      .attr('d', d => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const r = getNumber(d, config.pointRadius) / this._currentZoomLevel
        // Center at 0,0 for transform
        return getPointPathData({ x: 0, y: 0 }, r, shape)
      })
      .style('stroke', (d, i) => getColor(d, config.pointColor, i))
      .style('stroke-width', d => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape || TopoJSONMapPointShape.Circle
        const isRing = shape === TopoJSONMapPointShape.Ring
        const baseStrokeWidth = isRing ? getNumber(d, config.pointRingWidth) : getNumber(d, config.pointStrokeWidth)
        return baseStrokeWidth / this._currentZoomLevel
      })

    // Ring overlay update
    smartTransition(pointsMerged.select(`.${s.pointPathRing}`), duration)
      .attr('d', d => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape
        if (shape !== TopoJSONMapPointShape.Ring) return ''
        const r = getNumber(d, config.pointRadius) / this._currentZoomLevel
        return getPointPathData({ x: 0, y: 0 }, r, TopoJSONMapPointShape.Circle)
      })
      .style('display', d => {
        const shape = getString(d, config.pointShape) as TopoJSONMapPointShape
        return shape === TopoJSONMapPointShape.Ring ? null : 'none'
      })

    const pointLabelsMerged = pointsMerged.select(`.${s.pointLabel}`)
    pointLabelsMerged
      .text(d => getString(d, config.pointLabel) ?? '')
      .style('font-size', d => {
        const pointDiameter = 2 * getNumber(d, config.pointRadius)
        const pointLabelText = getString(d, config.pointLabel) || ''
        const textLength = pointLabelText.length
        const fontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)
        return clamp(fontSize, fontSize, 16) / this._currentZoomLevel
      })
      .attr('y', null)
      .attr('dy', '0.32em')

    smartTransition(pointLabelsMerged, duration)
      .style('fill', (d, i) => {
        const labelColor = getColor(d, config.pointLabelColor, i)
        if (labelColor) return labelColor

        const pointColor = getColor(d, config.pointColor, i)
        const hex = color(isStringCSSVariable(pointColor) ? getCSSVariableValue(pointColor, this.element) : pointColor)?.hex()
        if (!hex) return null

        const brightness = hexToBrightness(hex)
        return brightness > config.pointLabelTextBrightnessRatio ? 'var(--vis-map-point-label-text-color-dark)' : 'var(--vis-map-point-label-text-color-light)'
      })
      .style('opacity', 1)

    // Point Bottom Labels
    const pointBottomLabelsMerged = pointsMerged.select(`.${s.pointBottomLabel}`)
    pointBottomLabelsMerged
      .text(d => {
        const bottomLabelText = getString(d, config.pointBottomLabel) ?? ''
        return trimStringMiddle(bottomLabelText, 15)
      })
      .attr('y', d => {
        const pointRadius = getNumber(d, config.pointRadius) / this._currentZoomLevel
        return pointRadius + (12 / this._currentZoomLevel) // offset below the point, scaled with zoom
      })
      .attr('dy', '0.32em')
      .style('font-size', `calc(var(--vis-map-point-bottom-label-font-size, 10px) / ${this._currentZoomLevel})`)

    smartTransition(pointBottomLabelsMerged, duration)
      .style('opacity', 1)

    // Exit
    points.exit().remove()

    // Heatmap
    this._pointsGroup.style('filter', (config.heatmapMode && this._currentZoomLevel < config.heatmapModeZoomLevelThreshold) ? 'url(#heatmapFilter)' : null)
    this._pointsGroup.selectAll(`.${s.pointLabel}`).style('display', (config.heatmapMode && (this._currentZoomLevel < config.heatmapModeZoomLevelThreshold)) ? 'none' : null)
    this._pointsGroup.selectAll(`.${s.pointBottomLabel}`).style('display', (config.heatmapMode && (this._currentZoomLevel < config.heatmapModeZoomLevelThreshold)) ? 'none' : null)
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

    this._isZooming = true

    // Clear any pending zoom end timeout
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(this._onZoomHandler.bind(this, event.transform, isMouseEvent, isExternalEvent))

    if (isMouseEvent) {
      // Update the center coordinate so that the next call to _applyZoom()
      // will zoom with respect to the current view
      this._center = [event.transform.x, event.transform.y]
    }
    this._currentZoomLevel = (event?.transform.k / this._initialScale) || 1

    // Fallback timeout in case zoom end event doesn't fire
    this._zoomEndTimeoutId = setTimeout(() => {
      this._isZooming = false
      this._runCollisionDetection()
    }, 150)
  }

  _onZoomEnd (): void {
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }
    this._isZooming = false
    this._runCollisionDetection()
  }

  private _runCollisionDetection (): void {
    window.cancelAnimationFrame(this._collisionDetectionAnimFrameId)
    this._collisionDetectionAnimFrameId = window.requestAnimationFrame(() => {
      // Run collision detection for area labels
      const areaLabels = this._areaLabelsGroup.selectAll<SVGTextElement, any>(`.${s.areaLabel}`)
      collideAreaLabels(areaLabels)
    })
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
    this._renderAreaLabels(customDuration)
    this._renderLinks(customDuration)
    this._renderPoints(customDuration)
    this._renderSourcePoints(customDuration)
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
      // Create source point
      const sourcePos = this._projection([sourceLon, sourceLat])
      if (sourcePos) {
        const sourcePoint = {
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

      // Use the same arc as _renderLinks for flow animation
      const sourceProj = this._projection([sourceLon, sourceLat])
      const targetProj = this._projection([targetLon, targetLat])
      if (!sourceProj || !targetProj) return

      // Generate SVG arc path string using the same arc() function
      const arcPath = arc(sourceProj, targetProj)
      // Create a temporary SVG path element for sampling
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      tempPath.setAttribute('d', arcPath)
      const pathLength = tempPath.getTotalLength()

      const dist = Math.sqrt((targetLat - sourceLat) ** 2 + (targetLon - sourceLon) ** 2)
      const numParticles = Math.max(1, Math.round(dist * getNumber(link, config.flowParticleDensity)))
      const velocity = getNumber(link, config.flowParticleSpeed)
      const radius = getNumber(link, config.flowParticleRadius)
      const color = getColor(link, config.flowParticleColor, i)

      for (let j = 0; j < numParticles; j += 1) {
        const progress = j / numParticles
        const pt = tempPath.getPointAtLength(progress * pathLength)
        const particle: FlowParticle = {
          x: pt.x,
          y: pt.y,
          velocity,
          radius,
          color,
          progress,
          arcPath,
          pathLength,
          id: `${getString(link, config.linkId, i) || i}-${j}`,
          flowData: undefined,
        }
        this._flowParticles.push(particle)
      }
    })
  }

  private _renderSourcePoints (duration: number): void {
    const { config } = this

    const sourcePoints = this._sourcePointsGroup
      .selectAll<SVGCircleElement, any>(`.${s.sourcePoint}`)
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
    if (this._flowParticles.length === 0) return

    const zoomLevel = this._currentZoomLevel || 1

    this._flowParticles.forEach(particle => {
      // Move particle along the arc path using progress
      particle.progress += particle.velocity * 0.01
      if (particle.progress > 1) particle.progress = 0

      // Use the stored SVG path and pathLength
      if (particle.arcPath && typeof particle.pathLength === 'number') {
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        tempPath.setAttribute('d', particle.arcPath)
        const pt = tempPath.getPointAtLength(particle.progress * particle.pathLength)
        particle.x = pt.x
        particle.y = pt.y
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
    window.cancelAnimationFrame(this._collisionDetectionAnimFrameId)
    if (this._zoomEndTimeoutId) {
      clearTimeout(this._zoomEndTimeoutId)
    }
  }
}
