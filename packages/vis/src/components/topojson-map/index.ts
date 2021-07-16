// Copyright (c) Volterra, Inc. All rights reserved.
import { ZoomBehavior, zoom, zoomIdentity, ZoomTransform, D3ZoomEvent } from 'd3-zoom'
import { timeout } from 'd3-timer'
import { geoPath, GeoProjection } from 'd3-geo'
import { color } from 'd3-color'
import { feature, mesh } from 'topojson-client'

// Core
import { ComponentCore } from 'core/component'
import { MapGraphDataModel } from 'data-models/map-graph'

// Utils
import { clamp, getValue, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor, hexToBrightness } from 'utils/color'
import { getCSSVariableValue, isStringCSSVariable } from 'utils/misc'

// Local Types
import { Projection, MapInputNode, MapInputLink, MapInputArea } from './types'

// Config
import { TopoJSONMapConfig, TopoJSONMapConfigInterface } from './config'

// Modules
import { getLonLat, arc } from './utils'

// Styles
import * as s from './style'

export class TopoJSONMap<N extends MapInputNode, L extends MapInputLink, A extends MapInputArea> extends ComponentCore<{nodes: N[]; links?: L[]; areas?: A[]}> {
  static selectors = s
  config: TopoJSONMapConfig<N, L, A> = new TopoJSONMapConfig()
  datamodel: MapGraphDataModel<N, L, A> = new MapGraphDataModel()
  private _firstRender = true
  private _initialScale = undefined
  private _currentZoomLevel = undefined
  private _path = geoPath()
  private _projection: GeoProjection
  private _prevWidth: number
  private _prevHeight: number
  private _animFrameId: number

  private _featureCollection: GeoJSON.FeatureCollection
  private _zoomBehavior: ZoomBehavior<SVGRectElement, any> = zoom()
  private _backgroundRect = this.g.append('rect').attr('class', s.background)
  private _featuresGroup = this.g.append('g').attr('class', s.features)
  private _boundariesGroup = this.g.append('g').attr('class', s.boundaries)
  private _linksGroup = this.g.append('g').attr('class', s.links)
  private _pointsGroup = this.g.append('g').attr('class', s.points)

  events = {
    [TopoJSONMap.selectors.point]: {},
    [TopoJSONMap.selectors.feature]: {},
  }

  constructor (config?: TopoJSONMapConfigInterface<N, L, A>, data?: {nodes: N[]; links: L[]; areas: A[]}) {
    super()
    this.g.attr('class', s.map)
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

  setConfig (config?: TopoJSONMapConfigInterface<N, L, A>): void {
    super.setConfig(config)

    const newProjection = Projection[this.config.projection]()
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

  _renderMap (duration: number): void {
    const { bleed, config, datamodel } = this

    this.g.attr('transform', `translate(${bleed.left}, ${bleed.top})`)
    const mapData: TopoJSON.Topology = config.topojson
    const featureName = config.mapFeatureName
    const featureObject = mapData?.objects?.[featureName]
    if (!featureObject) return

    this._featureCollection = feature(mapData, featureObject) as GeoJSON.FeatureCollection
    const featureData = this._featureCollection?.features ?? []
    const boundariesData = [mesh(mapData, featureObject, (a, b) => a !== b)]

    if (this._firstRender) {
      // Rendering the map for the first time.
      this._projection.fitExtent([[0, 0], [config.width, config.height]], this._featureCollection)
      this._initialScale = this._projection.scale()
      this._currentZoomLevel = 1

      const zoomFactor = config.zoomFactor
      if (zoomFactor) {
        this._projection
          .scale(zoomFactor)
          .translate([config.width / 2, config.height / 2])
      } else {
        if (config.mapFitToPoints) {
          this._fitToPoints()
        } else {
          this._projection.fitExtent([[0, 0], [config.width, config.height]], this._featureCollection)
        }
      }

      const zoomExtent = config.zoomExtent
      this._zoomBehavior.scaleExtent([zoomExtent[0] * this._initialScale, zoomExtent[1] * this._initialScale])

      if (!config.disableZoom) {
        this.g.call(this._zoomBehavior)
        this._applyZoom()
      }

      this._prevWidth = config.width
      this._prevHeight = config.height
    }

    if (this._prevWidth !== config.width || this._prevHeight !== config.height) {
      this._onResize()
    }

    this._path.projection(this._projection)

    // Merge passed area data and map feature data
    const areaData = datamodel.areas
    areaData.forEach(a => {
      const feature = featureData.find(f => f.id.toString() === getValue(a, config.areaId).toString())
      // eslint-disable-next-line dot-notation
      if (feature) feature['data'] = a
      else if (this._firstRender) console.warn(`Can't find feature by area code ${a.id}`)
    })

    const features = this._featuresGroup.selectAll(`.${s.feature}`).data(featureData)
    const featuresEnter = features.enter().append('path').attr('class', s.feature)
    smartTransition(featuresEnter.merge(features), duration)
      .attr('d', this._path)
      .style('fill', (d, i) => d.data ? getColor(d.data, config.areaColor, i) : null)
      .style('cursor', d => d.data ? getValue(d.data, config.areaCursor) : null)
    features.exit().remove()

    const boundaries = this._boundariesGroup.selectAll(`.${s.boundary}`).data(boundariesData)
    const boundariesEnter = boundaries.enter().append('path').attr('class', s.boundary)
    smartTransition(boundariesEnter.merge(boundaries), duration)
      .attr('d', this._path)
    boundaries.exit().remove()
  }

  _renderLinks (duration: number): void {
    const { config, datamodel } = this
    const links = datamodel.links

    const edges = this._linksGroup.selectAll(`.${s.link}`).data(links)
    const edgesEnter = edges.enter().append('path').attr('class', s.link)
      .style('stroke-width', 0)
    smartTransition(edgesEnter.merge(edges), duration)
      .attr('d', link => {
        const source = this._projection(getLonLat(link.source, config.longitude, config.latitude))
        const target = this._projection(getLonLat(link.target, config.longitude, config.latitude))
        return arc(source, target)
      })
      .style('stroke-width', link => getValue(link, config.linkWidth))
      .style('cursor', link => getValue(link, config.linkCursor))
      .style('stroke', (link, i) => getColor(link, config.linkColor, i))
    edges.exit().remove()
  }

  _renderPoints (duration: number): void {
    const { config, datamodel } = this
    const pointData = datamodel.nodes

    const points = this._pointsGroup.selectAll(`.${s.point}`).data(pointData, (d, i) => getValue(d, config.pointId, i))

    // Enter
    const pointsEnter = points.enter().append('g').attr('class', s.point)
      .attr('transform', d => {
        const pos = this._projection(getLonLat(d, config.longitude, config.latitude))
        return `translate(${pos[0]},${pos[1]})`
      })

    pointsEnter.append('circle').attr('class', s.pointCircle)
      .attr('r', 0)
      .style('fill', (d, i) => getColor(d, config.pointColor, i))
      .style('stroke-width', d => getValue(d, config.pointStrokeWidth))

    pointsEnter.append('text').attr('class', s.pointLabel)
      .attr('dy', '0.32em')
      .style('opacity', 0)

    // Update
    const pointsMerged = pointsEnter.merge(points)
    smartTransition(pointsMerged, duration)
      .attr('transform', d => {
        const pos = this._projection(getLonLat(d, config.longitude, config.latitude))
        return `translate(${pos[0]},${pos[1]})`
      })
      .style('cursor', d => getValue(d, config.pointCursor))

    smartTransition(pointsMerged.select(`.${s.pointCircle}`), duration)
      .attr('r', d => getValue(d, config.pointRadius))
      .style('fill', (d, i) => getColor(d, config.pointColor, i))
      .style('stroke', (d, i) => getColor(d, config.pointColor, i))
      .style('stroke-width', d => getValue(d, config.pointStrokeWidth))

    const pointLabelsMerged = pointsMerged.select(`.${s.pointLabel}`)
    pointLabelsMerged
      .text(config.pointLabel ?? '')
      .attr('font-size', d => {
        const pointDiameter = 2 * getValue(d, config.pointRadius)
        const pointLabelText = getValue(d, config.pointLabel) || ''
        const textLength = pointLabelText.length
        const fontSize = 0.5 * pointDiameter / Math.pow(textLength, 0.4)
        return clamp(fontSize, fontSize, 16)
      })

    smartTransition(pointLabelsMerged, duration)
      .style('fill', (d, i) => {
        const pointColor = getColor(d, config.pointColor, i)
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
    this._pointsGroup.selectAll(`.${s.pointLabel}`).style('display', this._currentZoomLevel < config.heatmapModeZoomLevelThreshold ? 'none' : null)
  }

  _fitToPoints (points?, pad = 0.1): void {
    const { config, datamodel } = this
    const pointData = points || datamodel.nodes
    if (pointData.length === 0) return

    const featureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPoint',
          coordinates: pointData.map(p => {
            return [
              getValue(p, d => getValue(d, config.longitude)),
              getValue(p, d => getValue(d, config.latitude)),
            ]
          }),
        },
      }],
      geometries: [],
    }

    this._projection.fitExtent([
      [config.width * pad, config.height * pad],
      [config.width * (1 - pad), config.height * (1 - pad)],
    ], featureCollection)

    const maxScale = config.zoomExtent[1] * this._initialScale
    if (this._projection.scale() > maxScale) this._projection.scale(maxScale)

    this._applyZoom()
  }

  _applyZoom (): void {
    const translate = this._projection.translate()
    const scale = this._projection.scale()
    this.g.call(this._zoomBehavior.transform, zoomIdentity.translate(translate[0], translate[1]).scale(scale))
  }

  _onResize (): void {
    const { config, _prevWidth, _prevHeight, _projection } = this
    const translatePrev = _projection.translate()
    _projection.translate([
      translatePrev[0] * (1 + (config.width - _prevWidth) / _prevWidth),
      translatePrev[1] * (1 + (config.height - _prevHeight) / _prevHeight),
    ])
    this._applyZoom()
    this._prevWidth = config.width
    this._prevHeight = config.height
  }

  _onZoom (event: D3ZoomEvent<any, any>): void {
    if (this._firstRender) return // To prevent double render because of binding zoom behaviour
    const isMouseEvent = event.sourceEvent instanceof WheelEvent || event.sourceEvent instanceof MouseEvent
    const isClickEvent = isMouseEvent && event.sourceEvent.type === 'click'

    window.cancelAnimationFrame(this._animFrameId)
    this._animFrameId = window.requestAnimationFrame(this._onZoomHandler.bind(this, event.transform, isMouseEvent, isClickEvent))

    this._currentZoomLevel = (event?.transform.k / this._initialScale) || 1
  }

  _onZoomHandler (transform: ZoomTransform, isMouseEvent: boolean, isClickEvent: boolean): void {
    const { config } = this
    this._projection
      .scale(transform.k)
      .translate([transform.x, transform.y])

    // We are assuming that click events correspond to Zoom Controls button clicks,
    // so we're triggering render with specific animation duration in that case
    const customDuration = isClickEvent
      ? config.zoomDuration
      : (isMouseEvent ? 0 : null)
    this._render(customDuration)
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
    const translate = this._projection.translate()
    this._projection
      .scale(this._initialScale * this._currentZoomLevel)
      .translate(translate)

    // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
    // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
    // that the zoom state has changed
    this._applyZoom()
  }

  public fitView (): void {
    const { config } = this
    this._projection.fitExtent([[0, 0], [config.width, config.height]], this._featureCollection)
    this._currentZoomLevel = (this._projection?.scale() / this._initialScale) || 1

    // We are using this._applyZoom() instead of directly calling this._render(config.zoomDuration) because
    // we've to "attach" new transform to the map group element. Otherwise zoomBehavior  will not know
    // that the zoom state has changed
    this._applyZoom()
  }

  destroy (): void {
    window.cancelAnimationFrame(this._animFrameId)
  }
}
