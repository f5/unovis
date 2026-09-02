import { Selection } from 'd3-selection'

// Utils
import { smartTransition } from '@/utils/d3'
import { isArray, isNumber, isNumberWithinRange, isString } from '@/utils/data'
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
import { LINE_STYLE, VERTICAL_X, HORIZONTAL_X, VERTICAL_Y, HORIZONTAL_Y } from './constants'
import { PlotlineDefaultConfig, PlotlineConfigInterface } from './config'
import { PlotlineLabelPosition, PlotlineLabelOrientation, PlotlineLabelLayout, PlotlineLayoutValue } from './types'

// Styles
import * as s from './style'

export class Plotline<Datum> extends XYComponentCore<Datum, PlotlineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = PlotlineDefaultConfig as PlotlineConfigInterface<Datum>
  value: number | null | undefined
  plotline: Selection<SVGLineElement, unknown, null, undefined>
  labelGroup: Selection<SVGGElement, unknown, null, undefined>
  label: Selection<SVGTextElement, unknown, null, undefined>

  constructor (config: PlotlineConfigInterface<Datum>) {
    super()
    this.setConfig(config)

    this.plotline = this.g
      .append('line')
      .attr('class', s.plotline)

    // The label is rendered into a group, so that its position can be transitioned
    // independently of the text layout
    this.labelGroup = this.g
      .append('g')

    this.label = this.labelGroup
      .append('text')
      .attr('class', s.label)
  }

  /** Extra space required to fit the plotline label, which is otherwise clipped
   * when the plotline is drawn close to the edge of the chart. */
  get bleed (): Spacing {
    const { config } = this

    // The plotline is clipped out completely when its value is outside of the domain, so there's nothing to fit in
    const labelTextBlocks = this._getLabelTextBlocks()
    if (!labelTextBlocks.length || !this._isValueWithinDomain()) return { top: 0, bottom: 0, left: 0, right: 0 }

    // Only the label position along the plotline's own axis follows the scale range: the other
    // coordinate is derived from the component size, so bleeding in that direction would
    // shrink the chart without moving the label
    const isYAxis = config.axis === AxisType.Y
    const scale = isYAxis ? this.yScale : this.xScale
    return labelBboxToBleed(this._getLabelBBox(this._getLabelLayout(), labelTextBlocks), scale.range(), isYAxis)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    this.value = config.value

    // Hide the component when there's no value to draw the plotline at, instead of letting the
    // scale coerce `null` into a number
    const isValueDefined = isNumber(this.value)
    this.g.style('display', isValueDefined ? null : 'none')
    if (!isValueDefined) return

    const strokeDashArray = isString(config.lineStyle) ? LINE_STYLE[config.lineStyle]
      : isArray(config.lineStyle) ? config.lineStyle.join(',')
        : 'none'

    this.plotline
      .attr('stroke-opacity', 1)
      .style('stroke-width', config.lineWidth)
      .style('stroke-dasharray', strokeDashArray)
      .style('stroke', config.color)

    const { x1, y1, x2, y2 } = this._getLineCoordinates()
    smartTransition(this.plotline, duration)
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', y1)
      .attr('y2', y2)

    // The label is not rendered when the value is outside of the domain, so that it doesn't
    // float in the chart while the plotline itself is clipped out
    const labelTextBlocks = this._getLabelTextBlocks()
    if (labelTextBlocks.length && this._isValueWithinDomain()) {
      const layout = this._getLabelLayout()

      // Keep the label within the chart bounds: the bleed can hit its cap, and it can't help
      // across the plotline's axis where the label doesn't follow the scale
      const fit = getRectFitTranslation(this._getLabelBBox(layout, labelTextBlocks), { x: 0, y: 0, width: this._width, height: this._height })

      renderTextToSvgTextElement(this.label.node(), labelTextBlocks, { x: 0, y: 0, textAlign: layout.textAlign, verticalAlign: layout.verticalAlign, fastMode: false }, 'hanging')

      smartTransition(this.labelGroup, duration)
        .attr('transform', `translate(${layout.x + fit.dx},${layout.y + fit.dy}) rotate(${layout.rotation})`)
    } else {
      this.label.text(null)
    }
  }

  private _isValueWithinDomain (): boolean {
    const { config } = this
    const scale = config.axis === AxisType.Y ? this.yScale : this.xScale
    const domain = scale.domain() as [number, number]
    return isNumber(config.value) && isNumberWithinRange(config.value, domain)
  }

  private _getLineCoordinates (): { x1: number; y1: number; x2: number; y2: number } {
    const { config } = this

    if (config.axis === AxisType.Y) {
      const y = this.yScale(config.value)
      return { x1: 0, y1: y, x2: this._width, y2: y }
    }

    const x = this.xScale(config.value)
    return { x1: x, y1: 0, x2: x, y2: this._height }
  }

  private _getLabelFontSize (): number {
    const { config } = this
    return config.labelSize ||
      getCSSVariableValueInPixels('var(--vis-plotline-label-font-size)', this.element) ||
      UNOVIS_TEXT_DEFAULT_FONT_SIZE
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

  /** The label's bounding box for the given layout, in the component's coordinate system */
  private _getLabelBBox (layout: PlotlineLabelLayout, textBlocks: UnovisText[]): Rect {
    const wrappedText = getWrappedText(textBlocks, undefined, undefined, false)
    const bbox = getWrappedTextAabb(wrappedText, layout.textAlign, layout.verticalAlign, layout.rotation)
    return { ...bbox, x: layout.x + bbox.x, y: layout.y + bbox.y }
  }

  private _getLabelLayout (): PlotlineLabelLayout {
    const { config } = this
    const isYAxis = config.axis === AxisType.Y

    return this.computeLabel(
      config.axis,
      isYAxis ? this._width : this.xScale(config.value),
      isYAxis ? this.yScale(config.value) : this._height,
      config.labelPosition,
      config.labelOffsetX,
      config.labelOffsetY,
      config.labelOrientation
    )
  }

  private computeLabel (
    axis: AxisType | string,
    width: number,
    height: number,
    position: PlotlineLabelPosition,
    offsetX: number,
    offsetY: number,
    orientation: PlotlineLabelOrientation
  ): PlotlineLabelLayout {
    const isVertical = orientation === PlotlineLabelOrientation.Vertical
    const rotation = isVertical ? -90 : 0

    const layoutMap = axis === AxisType.X
      ? (isVertical ? VERTICAL_X : HORIZONTAL_X)
      : (isVertical ? VERTICAL_Y : HORIZONTAL_Y)
    // `position` is typed as the enum but can hold any string when the config
    // comes from JSON; fall back to the default instead of calling whatever
    // the lookup happens to reach
    const layoutFn = layoutMap[position]
    const layout: PlotlineLayoutValue = (typeof layoutFn === 'function' ? layoutFn : layoutMap[PlotlineLabelPosition.TopRight])({ width, height, offsetX, offsetY })

    return {
      ...layout,
      rotation,
    }
  }
}
