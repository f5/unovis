import { Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'
import { pie, arc } from 'd3-shape'

// Core
import { ComponentCore } from '@/core/component'
import { SeriesDataModel } from '@/data-models/series'

// Utils
import { smartTransition } from '@/utils/d3'
import { isNumber, clamp, getNumber, getString } from '@/utils/data'
import { wrapSVGText } from '@/utils/text'

// Types
import { Spacing } from '@/types/spacing'

// Circular Bar Modules
import { createIcon, updateIcon, removeIcon } from '@/components/circular-bar/modules/icon'

// Local Types
import { DonutArcDatum, DonutArcAnimState, DonutDatum, DonutIconDatum } from './types'

// Config
import { DonutDefaultConfig, DonutConfigInterface } from './config'

// Modules
import { createArc, updateArc, removeArc, ArcNode } from './modules/arc'

// Local Utils
import { applyMinSegmentAngle, getArcBisectorClearance } from './utils'

// Constants
import {
  DONUT_HALF_ANGLE_RANGES,
  DONUT_DEFAULT_ICON_SIZE_RATIO,
  DONUT_DEFAULT_MAX_ICON_SIZE_RATIO,
  DONUT_DEFAULT_MAX_ICON_SIZE,
  DONUT_ICON_CLEARANCE_RATIO,
} from './constants'

// Styles
import * as s from './style'

export class Donut<Datum> extends ComponentCore<Datum[], DonutConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = DonutDefaultConfig as DonutConfigInterface<Datum>
  public config: DonutConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  arcBackground: Selection<SVGPathElement, unknown, SVGGElement, unknown>
  arcGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  iconGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  centralLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  centralSubLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  arcGen = arc<DonutArcAnimState>()

  events = {
  }

  // Skip position animation on the first render, nothing to morph from yet.
  private _firstRender = true

  constructor (config?: DonutConfigInterface<Datum>) {
    super()
    this.setConfig(config)
    this.arcBackground = this.g.append('path')
    this.arcGroup = this.g.append('g')
    this.iconGroup = this.g.append('g')
      .attr('class', s.iconGroup)
    this.centralLabel = this.g.append('text')
      .attr('class', s.centralLabel)
    this.centralSubLabel = this.g.append('text')
      .attr('class', s.centralSubLabel)
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    const { config, datamodel, bleed } = this

    // Wrap data to preserve original indices
    const data: DonutDatum<Datum>[] = datamodel.data
      .map((d, i) => ({
        index: i,
        datum: d,
      }))
      .filter(d => config.showEmptySegments || getNumber(d.datum, config.value, d.index))

    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Handle half-donut cases, which adjust the scaling and positioning.
    // One of these is true if we are dealing with a half-donut.
    const [
      isHalfDonutTop,
      isHalfDonutRight,
      isHalfDonutBottom,
      isHalfDonutLeft,
    ] = DONUT_HALF_ANGLE_RANGES.map(angleRange =>
      config.angleRange && (
        config.angleRange[0] === angleRange[0] &&
        config.angleRange[1] === angleRange[1]
      )
    )
    const isVerticalHalfDonut = isHalfDonutTop || isHalfDonutBottom
    const isHorizontalHalfDonut = isHalfDonutRight || isHalfDonutLeft

    // Compute the bounding box of the donut,
    // considering it may be a half-donut
    const width = this._width * (isHorizontalHalfDonut ? 2 : 1)
    const height = this._height * (isVerticalHalfDonut ? 2 : 1)

    const outerRadius = config.radius || Math.min(width - bleed.left - bleed.right, height - bleed.top - bleed.bottom) / 2
    const innerRadius = config.arcWidth === 0 ? 0 : clamp(outerRadius - config.arcWidth, 0, outerRadius - 1)

    const translateY = this._height / 2 + (isHalfDonutTop ? outerRadius / 2 : isHalfDonutBottom ? -outerRadius / 2 : 0)
    const translateX = this._width / 2 + (isHalfDonutLeft ? outerRadius / 2 : isHalfDonutRight ? -outerRadius / 2 : 0)
    const translate = `translate(${translateX},${translateY})`

    const positionDuration = this._firstRender ? 0 : duration

    // Animate position together with the arcs. Otherwise switching between
    // full and half jumps to the new layout first and animates after.
    smartTransition(this.arcGroup, positionDuration).attr('transform', translate)
    smartTransition(this.iconGroup, positionDuration).attr('transform', translate)

    this.arcGen
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .padAngle(d => d.padAngle)
      .cornerRadius(config.cornerRadius)

    const pieGen = pie<DonutDatum<Datum>>()
      .startAngle(config.angleRange?.[0] ?? 0)
      .endAngle(config.angleRange?.[1] ?? 2 * Math.PI)
      .padAngle(config.padAngle)
      .value(d => getNumber(d.datum, config.value, d.index) || 0)
      .sort((a, b) => config.sortFunction?.(a.datum, b.datum))

    const pieData = pieGen(data)
    if (isNumber(config.minSegmentAngle)) {
      applyMinSegmentAngle(pieData, config.minSegmentAngle, [
        config.angleRange?.[0] ?? 0,
        config.angleRange?.[1] ?? 2 * Math.PI,
      ])
    }

    const arcData: DonutArcDatum<Datum>[] = pieData.map(d => {
      const arc = {
        ...d,
        data: d.data.datum,
        index: d.data.index,
        innerRadius,
        outerRadius,
      }

      if (config.showEmptySegments && d.endAngle - d.startAngle - d.padAngle <= Number.EPSILON) {
        arc.endAngle = d.startAngle + Math.max(config.emptySegmentAngle, config.padAngle)
        arc.padAngle = d.padAngle / 2
      }
      return arc
    })

    // Arc segments
    const arcsSelection = this.arcGroup
      .selectAll<SVGPathElement, DonutArcDatum<Datum>>(`.${s.segment}`)
      .data(arcData, (d: DonutArcDatum<Datum>) => config.id(d.data, d.index))

    const arcsEnter = arcsSelection.enter().append('path')
      .attr('class', s.segment)
      .call(createArc, config)

    const arcsMerged = arcsSelection.merge(arcsEnter)
    arcsMerged.call(updateArc, config, this.arcGen, duration)
    arcsMerged.sort((a, b) => b.value - a.value)

    arcsSelection.exit<DonutArcDatum<Datum>>()
      .attr('class', s.segmentExit)
      .call(removeArc, duration)

    this._renderIcons(arcData, duration)

    // Label
    const labelTextAnchor = isHalfDonutRight ? 'start' : isHalfDonutLeft ? 'end' : 'middle'
    this.centralLabel
      .attr('dy', config.centralSubLabel ? '-0.55em' : null)
      .style('text-anchor', labelTextAnchor)
      .text(config.centralLabel ?? null)

    this.centralSubLabel
      .attr('dy', config.centralLabel ? '0.55em' : null)
      .style('text-anchor', labelTextAnchor)
      .text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, innerRadius * 1.9)

    // Label placement
    const labelTranslateX = (config.centralLabelOffsetX || 0) + translateX
    let labelTranslateY = (config.centralLabelOffsetY || 0) + translateY

    // Special case label placement for half donut
    if (isVerticalHalfDonut && config.centralLabelOffsetX === undefined && config.centralLabelOffsetY === undefined) {
      const halfDonutLabelOffsetY = isHalfDonutTop
        ? -this.centralSubLabel.node().getBoundingClientRect().height
        : isHalfDonutBottom
          ? this.centralLabel.node().getBoundingClientRect().height
          : 0
      labelTranslateY = halfDonutLabelOffsetY + translateY
    }
    const labelTranslate = `translate(${labelTranslateX},${labelTranslateY})`
    smartTransition(this.centralLabel, positionDuration).attr('transform', labelTranslate)
    smartTransition(this.centralSubLabel, positionDuration).attr('transform', labelTranslate)

    // Background
    this.arcBackground.attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')

    const backgroundAnimState: DonutArcAnimState = {
      startAngle: config.backgroundAngleRange?.[0] ?? config.angleRange?.[0] ?? 0,
      endAngle: config.backgroundAngleRange?.[1] ?? config.angleRange?.[1] ?? 2 * Math.PI,
      innerRadius,
      outerRadius,
    }

    if (positionDuration) {
      // Tween the angle/radius values and rebuild the path each tick, same
      // as the arc segments do via updateArc. Letting D3 interpolate the d
      // string directly breaks the arc flags, they become non-integer
      // mid-transition and the browser rejects them.
      const node = this.arcBackground.node() as ArcNode
      const prevAnimState = node._animState ?? backgroundAnimState
      const interpolateState = interpolate(prevAnimState, backgroundAnimState)
      const transition = smartTransition(this.arcBackground, positionDuration)
        .attr('transform', translate) as Transition<SVGPathElement, unknown, SVGGElement, unknown>

      transition.attrTween('d', () => (t: number): string => {
        node._animState = interpolateState(t)
        return this.arcGen(node._animState as DonutArcAnimState)
      })
    } else {
      const node = this.arcBackground.node() as ArcNode
      node._animState = backgroundAnimState
      this.arcBackground
        .attr('transform', translate)
        .attr('d', this.arcGen(backgroundAnimState))
    }

    this._firstRender = false
  }

  private _renderIcons (arcData: DonutArcDatum<Datum>[], duration: number): void {
    const { config } = this

    // Icons sit on the segment's bisector in the middle of the arc, where d3 places the arc's centroid
    const iconData: DonutIconDatum<Datum>[] = config.icon ? arcData.map(d => {
      const icon = getString(d.data, config.icon, d.index)
      if (!icon) return undefined
      const defaultIconSize = Math.min(
        (d.outerRadius - d.innerRadius) * DONUT_DEFAULT_ICON_SIZE_RATIO,
        d.outerRadius * DONUT_DEFAULT_MAX_ICON_SIZE_RATIO,
        DONUT_DEFAULT_MAX_ICON_SIZE
      )
      const iconSize = getNumber(d.data, config.iconSize, d.index) ?? defaultIconSize
      const radius = (d.innerRadius + d.outerRadius) / 2
      const clearance = getArcBisectorClearance(d.startAngle, d.endAngle, d.padAngle, d.innerRadius, d.outerRadius, radius)

      return {
        data: d.data,
        index: d.index,
        icon,
        iconSize,
        angle: (d.startAngle + d.endAngle) / 2,
        radius,
        visible: clearance >= iconSize * DONUT_ICON_CLEARANCE_RATIO,
      }
    }).filter(Boolean) : []

    const iconsSelection = this.iconGroup
      .selectAll<SVGGElement, DonutIconDatum<Datum>>(`.${s.icon}`)
      .data(iconData, (d: DonutIconDatum<Datum>) => config.id(d.data, d.index))

    const iconsEnter = iconsSelection.enter().append('g')
      .attr('class', s.icon)
      .call(createIcon)

    iconsSelection.merge(iconsEnter).call(updateIcon, duration)
    iconsSelection.exit<DonutIconDatum<Datum>>()
      .attr('class', s.iconExit)
      .call(removeIcon, duration)
  }
}

