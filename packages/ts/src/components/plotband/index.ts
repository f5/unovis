import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from '@/utils/d3'
import { clamp, isArray, isNumber, isString } from '@/utils/data'
import { getCSSVariableValueInPixels, getRectFitTranslation } from '@/utils/misc'
import { labelBboxToBleed } from '@/utils/bleed'
import { getWrappedText, getWrappedTextAabb, renderTextToSvgTextElement } from '@/utils/text'
import { getCachedFontFamily } from '@/utils/text-measure'

// Core
import { XYComponentCore } from '@/core/xy-component'
import { AxisType } from '@/components/axis/types'

// Types
import { Rect } from '@/types/misc'
import { Spacing } from '@/types/spacing'
import { UnovisText } from '@/types/text'

// Styles
import { UNOVIS_TEXT_DEFAULT_FONT_SIZE } from '@/styles'

// Config
import { VERTICAL_X, HORIZONTAL_X, VERTICAL_Y, HORIZONTAL_Y } from './constants'
import { PlotbandDefaultConfig, PlotbandConfigInterface } from './config'
import { PlotbandLabelOrientation, PlotbandLabelPosition, PlotbandLabelLayout } from './types'

// Styles
import * as s from './style'

export class Plotband<Datum> extends XYComponentCore<Datum, PlotbandConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotbandDefaultConfig as PlotbandConfigInterface<Datum>
  from: number | null | undefined
  to: number | null | undefined
  plotband: Selection<SVGRectElement, unknown, null, undefined>
  labelGroup: Selection<SVGGElement, unknown, null, undefined>
  label: Selection<SVGTextElement, unknown, null, undefined>

  constructor (config: PlotbandConfigInterface<Datum>) {
    super()
    this.setConfig(config)

    this.plotband = this.g.append('rect')
      .attr('class', s.plotband)

    // The label is rendered into a group, so that its position can be transitioned
    // independently of the text layout
    this.labelGroup = this.g
      .append('g')

    this.label = this.labelGroup
      .append('text')
      .attr('class', s.label)
  }

  /** Extra space required to fit the plotband label, which is otherwise clipped
   * when the plotband is drawn close to the edge of the chart. */
  get bleed (): Spacing {
    const { config } = this
    const noBleed: Spacing = { top: 0, bottom: 0, left: 0, right: 0 }
    const labelTextBlocks = this._getLabelTextBlocks()
    if (!labelTextBlocks.length || !isNumber(config.from) || !isNumber(config.to)) return noBleed

    // There's nothing to fit in when the band is fully outside of the visible area
    const bandRect = this._getVisibleBandRect()
    if (!bandRect) return noBleed

    // Only the label position along the plotband's own axis follows the scale range: the other
    // coordinate is derived from the component size, so bleeding in that direction would
    // shrink the chart without moving the label
    const isYAxis = config.axis === AxisType.Y
    const scale = isYAxis ? this.yScale : this.xScale
    return labelBboxToBleed(this._getLabelBBox(this._getLabelLayout(bandRect), labelTextBlocks), scale.range(), isYAxis)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    this.from = config.from
    this.to = config.to

    this.plotband
      .style('fill', config.color)

    // Hide the component when there's no band to draw, so that the previously rendered
    // band doesn't stay on the chart
    const isBandDefined = isNumber(this.from) && isNumber(this.to)
    this.g.style('display', isBandDefined ? null : 'none')
    if (!isBandDefined) return

    const { x, y, width, height } = this._getBandRect()

    smartTransition(this.plotband, duration)
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)

    // The label is positioned relative to the visible part of the band, so that it stays in view
    // when the band extends beyond the domain
    const labelBandRect = this._getVisibleBandRect()
    const labelTextBlocks = this._getLabelTextBlocks()
    if (labelTextBlocks.length && labelBandRect) {
      const layout = this._getLabelLayout(labelBandRect)

      // Keep the label within the chart bounds: the bleed can hit its cap, and it can't help
      // across the plotband's axis where the label doesn't follow the scale
      const fit = getRectFitTranslation(this._getLabelBBox(layout, labelTextBlocks), { x: 0, y: 0, width: this._width, height: this._height })

      renderTextToSvgTextElement(this.label.node(), labelTextBlocks, { x: 0, y: 0, textAlign: layout.textAlign, verticalAlign: layout.verticalAlign, fastMode: false }, 'hanging')

      smartTransition(this.labelGroup, duration)
        .attr('transform', `translate(${layout.x + fit.dx},${layout.y + fit.dy}) rotate(${layout.rotation})`)
    } else {
      this.label.text(null)
    }
  }

  private _getLabelFontSize (): number {
    const { config } = this
    return config.labelSize ||
      getCSSVariableValueInPixels('var(--vis-plotband-label-font-size)', this.element) ||
      UNOVIS_TEXT_DEFAULT_FONT_SIZE
  }

  /** The label's bounding box for the given layout, in the component's coordinate system */
  private _getLabelBBox (layout: PlotbandLabelLayout, textBlocks: UnovisText[]): Rect {
    const wrappedText = getWrappedText(textBlocks, undefined, undefined, false)
    const bbox = getWrappedTextAabb(wrappedText, layout.textAlign, layout.verticalAlign, layout.rotation)
    return { ...bbox, x: layout.x + bbox.x, y: layout.y + bbox.y }
  }

  /** The label as text blocks, used for both rendering and size estimation. The config-level
   * label options and CSS values act as defaults: values set on a text block take priority */
  private _getLabelTextBlocks (): UnovisText[] {
    const { config } = this
    if (!config.labelText) return []

    const defaults: Partial<UnovisText> = {
      fontSize: this._getLabelFontSize(),
      fontFamily: getCachedFontFamily(this.label.node()),
      color: config.labelColor,
    }

    const blocks = isString(config.labelText)
      ? [{ ...defaults, text: config.labelText }]
      : (isArray(config.labelText) ? config.labelText : [config.labelText]).map(block => ({ ...defaults, ...block }))

    return blocks.filter(block => block.text)
  }

  private _getBandRect (): Rect {
    const { config } = this

    if (config.axis === AxisType.Y) {
      const y1 = this.yScale(config.from)
      const y2 = this.yScale(config.to)
      return { x: 0, y: Math.min(y1, y2), width: this._width, height: Math.abs(y1 - y2) }
    }

    const x1 = this.xScale(config.from)
    const x2 = this.xScale(config.to)
    return { x: Math.min(x1, x2), y: 0, width: Math.abs(x1 - x2), height: this._height }
  }

  /** Band rect with its edges clamped to the scale range, or `null` if the band is fully out of view */
  private _getVisibleBandRect (): Rect | null {
    const { config } = this
    const isYAxis = config.axis === AxisType.Y
    const scale = isYAxis ? this.yScale : this.xScale
    const rangeStart = Math.min(...scale.range())
    const rangeEnd = Math.max(...scale.range())

    const rect = this._getBandRect()
    const bandStart = isYAxis ? rect.y : rect.x
    const bandEnd = bandStart + (isYAxis ? rect.height : rect.width)
    if (!isFinite(bandStart) || !isFinite(bandEnd) || bandEnd < rangeStart || bandStart > rangeEnd) return null

    const visibleStart = clamp(bandStart, rangeStart, rangeEnd)
    const visibleEnd = clamp(bandEnd, rangeStart, rangeEnd)

    return isYAxis
      ? { ...rect, y: visibleStart, height: visibleEnd - visibleStart }
      : { ...rect, x: visibleStart, width: visibleEnd - visibleStart }
  }

  private _getLabelLayout (bandRect: Rect): PlotbandLabelLayout {
    const { config } = this

    return this.computeLabel(
      config.axis,
      bandRect.x,
      bandRect.y,
      bandRect.width,
      bandRect.height,
      config.labelPosition,
      config.labelOffsetX,
      config.labelOffsetY,
      config.labelOrientation
    )
  }

  private computeLabel (
    axis: AxisType,
    startX: number,
    startY: number,
    width: number,
    height: number,
    position: PlotbandLabelPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotbandLabelOrientation
  ): PlotbandLabelLayout {
    const isVertical = orientation === PlotbandLabelOrientation.Vertical
    const rotation = isVertical ? -90 : 0
    const args = { startX, startY, width, height, offsetX, offsetY }

    let layoutPartial: Omit<PlotbandLabelLayout, 'rotation'>

    if (axis === AxisType.X) {
      layoutPartial = (isVertical ? VERTICAL_X : HORIZONTAL_X)[position](args)
    } else {
      layoutPartial = (isVertical ? VERTICAL_Y : HORIZONTAL_Y)[position](args)
    }

    return { ...layoutPartial, rotation }
  }
}
