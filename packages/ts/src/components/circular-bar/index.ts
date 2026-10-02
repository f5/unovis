import { Selection } from 'd3-selection'
import { max } from 'd3-array'

// Core
import { ComponentCore } from '@/core/component'
import { SeriesDataModel } from '@/data-models/series'

// Utils
import { smartTransition } from '@/utils/d3'
import { isNumber, isArray, clamp, getNumber, getString } from '@/utils/data'
import { getArcUnitBoundingBox } from '@/components/radial-bar/utils'

// Types
import { NumericAccessor } from '@/types/accessor'
import { Spacing } from '@/types/spacing'

// Local Types
import { CircularBarArcDatum, CircularBarArcAnimState, CircularBarDatum, CircularBarIconDatum } from './types'

// Config
import { CircularBarDefaultConfig, CircularBarConfigInterface } from './config'

// Modules
import { createBar, updateBar, removeBar, createBackground, updateBackground } from './modules/bar'
import { createIcon, updateIcon, removeIcon } from './modules/icon'

// Utils
import { getPetalBaseRadius, getPetalPath, getPetalDefaultInnerCornerRadius, getPetalInnerAnchorRadius } from './utils'

// Constants
import {
  CIRCULAR_BAR_DEFAULT_INNER_RADIUS_RATIO,
  CIRCULAR_BAR_DEFAULT_CORNER_RADIUS_RATIO,
  CIRCULAR_BAR_DEFAULT_PADDING_RATIO,
  CIRCULAR_BAR_DEFAULT_ICON_SIZE_RATIO,
  CIRCULAR_BAR_ICON_CLEARANCE_RATIO,
} from './constants'

// Styles
import * as s from './style'

export class CircularBar<Datum> extends ComponentCore<Datum[], CircularBarConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = CircularBarDefaultConfig as CircularBarConfigInterface<Datum>
  public config: CircularBarConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  backgroundGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  barGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  iconGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>

  events = {
  }

  constructor (config?: CircularBarConfigInterface<Datum>) {
    super()
    this.setConfig(config)
    this.backgroundGroup = this.g.append('g')
    this.barGroup = this.g.append('g')
    this.iconGroup = this.g.append('g')
      .attr('class', s.iconGroup)
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    const { config, datamodel, bleed } = this

    // Wrap data to preserve original indices and resolve values once
    const wrapped: CircularBarDatum<Datum>[] = datamodel.data
      .map((d, i) => ({ index: i, datum: d }))

    if (config.sortFunction) {
      wrapped.sort((a, b) => config.sortFunction(a.datum, b.datum))
    }

    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Compute geometry
    const width = this._width
    const height = this._height
    const availW = width - bleed.left - bleed.right
    const availH = height - bleed.top - bleed.bottom

    // By default the bars cover the full circle, and the first bar is centered at the top
    const n = wrapped.length
    const defaultStartAngle = n ? -Math.PI / n : 0
    const startAngle = config.angleRange?.[0] ?? defaultStartAngle
    const endAngle = config.angleRange?.[1] ?? defaultStartAngle + 2 * Math.PI
    const angleRange = endAngle - startAngle

    const unitBBox = getArcUnitBoundingBox(startAngle, endAngle)
    const bboxW = unitBBox.xMax - unitBBox.xMin
    const bboxH = unitBBox.yMax - unitBBox.yMin
    const outerRadius = config.radius ?? Math.min(availW / bboxW, availH / bboxH)
    // The shape defaults are relative to the chart radius, so that the bars keep their proportions at any size
    const innerRadius = clamp(config.innerRadius ?? outerRadius * CIRCULAR_BAR_DEFAULT_INNER_RADIUS_RATIO, 0, outerRadius)

    const bboxCx = (unitBBox.xMin + unitBBox.xMax) / 2
    const bboxCy = (unitBBox.yMin + unitBBox.yMax) / 2
    const translateX = bleed.left + availW / 2 - bboxCx * outerRadius
    const translateY = bleed.top + availH / 2 - bboxCy * outerRadius

    const barAngle = n ? angleRange / n : 0
    const barPadding = Math.max(0, config.barPadding ?? outerRadius * CIRCULAR_BAR_DEFAULT_PADDING_RATIO)
    const cornerRadius = Math.max(0, config.cornerRadius ?? outerRadius * CIRCULAR_BAR_DEFAULT_CORNER_RADIUS_RATIO)
    // By default the inner corners merge into a single rounded tip touching the inner radius, so that the inner
    // end of a bar stays a smooth curve regardless of the number of bars. The default depends on the bar's angle,
    // so it's resolved per animation frame (see `pathGen`), while bars change their angles after a data update
    const getInnerCornerRadius = (halfAngle: number): number => Math.max(0, config.innerCornerRadius ??
      getPetalDefaultInnerCornerRadius(halfAngle, innerRadius, outerRadius, barPadding, cornerRadius))
    const innerCornerRadius = getInnerCornerRadius(Math.abs(barAngle) / 2)

    // All the bars have the same angular size, so they all start at the same radius
    const baseRadius = getPetalBaseRadius(Math.abs(barAngle) / 2, innerRadius, outerRadius, barPadding, cornerRadius, innerCornerRadius)
    const barMinLength = clamp(config.barMinLength ?? 0, 0, outerRadius - baseRadius)

    // Resolve per-bar value and max. `null` and `undefined` are treated as missing data:
    // such bars are not rendered at all, unlike `0` values, which still get `barMinLength`.
    const values = wrapped.map((d) => {
      const value = getNumber(d.datum, config.value, d.index)
      return isNumber(value) && isFinite(value) ? value : null
    })
    const dataMax = max(values) ?? 0
    const maxValues = wrapped.map((d) => {
      const mv = config.maxValue
      if (isArray(mv)) {
        const v = mv[d.index]
        return (isNumber(v) ? v : dataMax) || 1
      }
      const resolved = getNumber(d.datum, mv as NumericAccessor<Datum>, d.index)
      return (resolved ?? dataMax) || 1
    })

    // Build arc datums per bar
    const arcData: CircularBarArcDatum<Datum>[] = wrapped.map((d, i) => {
      const value = values[i]
      const perMax = maxValues[i]
      const fraction = value === null ? 0 : clamp(value / perMax, 0, 1)

      // Bars with small values (including `0`) are extended to `barMinLength` to stay visible.
      // Bars with missing values are left collapsed and hidden (see `setOpacity` in `modules/bar`).
      const length = value === null ? 0 : Math.max(fraction * (outerRadius - baseRadius), barMinLength)

      return {
        data: d.datum,
        index: d.index,
        value,
        startAngle: startAngle + i * barAngle,
        endAngle: startAngle + (i + 1) * barAngle,
        innerRadius,
        outerRadius: baseRadius + length,
        baseRadius,
      }
    })

    const translate = `translate(${translateX},${translateY})`
    this.barGroup.attr('transform', translate)
    this.backgroundGroup.attr('transform', translate)
    this.iconGroup.attr('transform', translate)

    const pathGen = (state: CircularBarArcAnimState): string => getPetalPath(
      state.startAngle, state.endAngle, state.innerRadius, state.outerRadius, barPadding, cornerRadius,
      getInnerCornerRadius(Math.abs(state.endAngle - state.startAngle) / 2)
    )

    // Background bars
    const backgroundSelection = this.backgroundGroup
      .selectAll<SVGPathElement, CircularBarArcDatum<Datum>>(`.${s.background}`)
      .data(config.showBackground ? arcData : [], (d: CircularBarArcDatum<Datum>) => config.id(d.data, d.index))

    const backgroundEnter = backgroundSelection.enter().append('path')
      .attr('class', s.background)
      .call(createBackground, outerRadius)

    const backgroundMerged = backgroundSelection.merge(backgroundEnter)
    backgroundMerged.call(updateBackground, outerRadius, pathGen, duration)

    smartTransition(backgroundSelection.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Bars
    const barsSelection = this.barGroup
      .selectAll<SVGPathElement, CircularBarArcDatum<Datum>>(`.${s.bar}`)
      .data(arcData, (d: CircularBarArcDatum<Datum>) => config.id(d.data, d.index))

    const barsEnter = barsSelection.enter().append('path')
      .attr('class', s.bar)
      .call(createBar, config)

    const barsMerged = barsSelection.merge(barsEnter)
    barsMerged.call(updateBar, config, pathGen, duration)

    barsSelection.exit<CircularBarArcDatum<Datum>>()
      .attr('class', s.barExit)
      .call(removeBar, duration)

    this._renderIcons(arcData, outerRadius, barPadding, pathGen, duration)
  }

  private _renderIcons (
    arcData: CircularBarArcDatum<Datum>[],
    outerRadius: number,
    barPadding: number,
    pathGen: (state: CircularBarArcAnimState) => string,
    duration: number
  ): void {
    const { config } = this

    // Icons sit on the bar's bisector next to its inner end, clear of the bar's edges
    const iconData: CircularBarIconDatum<Datum>[] = config.icon ? arcData.map(d => {
      const icon = getString(d.data, config.icon, d.index)
      if (!icon) return undefined
      const iconSize = getNumber(d.data, config.iconSize, d.index) ?? outerRadius * CIRCULAR_BAR_DEFAULT_ICON_SIZE_RATIO
      const clearance = iconSize * CIRCULAR_BAR_ICON_CLEARANCE_RATIO
      const radius = getPetalInnerAnchorRadius(Math.abs(d.endAngle - d.startAngle) / 2, d.baseRadius, barPadding, clearance)

      return {
        data: d.data,
        index: d.index,
        icon,
        iconSize,
        angle: (d.startAngle + d.endAngle) / 2,
        radius,
        // Bars whose shape can't be built for the provided geometry aren't drawn, and neither are their icons
        visible: d.value !== null && d.outerRadius >= radius + clearance && !!pathGen(d),
      }
    }).filter(Boolean) : []

    const iconsSelection = this.iconGroup
      .selectAll<SVGGElement, CircularBarIconDatum<Datum>>(`.${s.icon}`)
      .data(iconData, (d: CircularBarIconDatum<Datum>) => config.id(d.data, d.index))

    const iconsEnter = iconsSelection.enter().append('g')
      .attr('class', s.icon)
      .call(createIcon)

    iconsSelection.merge(iconsEnter).call(updateIcon, duration)
    iconsSelection.exit<CircularBarIconDatum<Datum>>()
      .attr('class', s.iconExit)
      .call(removeIcon, duration)
  }
}
