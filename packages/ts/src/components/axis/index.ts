import { select, Selection } from 'd3-selection'
import { interrupt } from 'd3-transition'
import { Axis as D3Axis, axisBottom, axisLeft, axisRight, axisTop } from 'd3-axis'
import { NumberValue } from 'd3-scale'

// Core
import { XYComponentCore } from '@/core/xy-component'

// Types
import { Position } from '@/types/position'
import { ContinuousScale } from '@/types/scale'
import { Spacing } from '@/types/spacing'
import { FitMode, TextAlign, TrimMode, UnovisText, UnovisTextOptions, VerticalAlign } from '@/types/text'

// Utils
import { smartTransition } from '@/utils/d3'
import { renderTextToSvgTextElement, textAlignToAnchor, trimSVGText, wrapSVGText } from '@/utils/text'
import { isEqual } from '@/utils/data'
import { rectIntersect } from '@/utils/misc'
import { getFontWidthToHeightRatio } from '@/styles/index'

// Local Types
import { AxisType } from './types'

// Config
import { AxisDefaultConfig, AxisConfigInterface } from './config'

// Styles
import * as s from './style'

export class Axis<Datum> extends XYComponentCore<Datum, AxisConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig: AxisConfigInterface<Datum> = AxisDefaultConfig
  public config: AxisConfigInterface<Datum> = this._defaultConfig
  private axisGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private gridGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>

  private _axisRawBBox: DOMRect
  private _axisSizeBBox: SVGRect
  private _requiredMargin: Spacing
  private _defaultNumTicks = 3
  private _collideTickLabelsAnimFrameId: ReturnType<typeof requestAnimationFrame>
  private _tickTextStyleCached: {
    fontSize: number;
    fontFamily: string;
    fontWidthToHeightRatio: number;
  }

  protected events = {}

  constructor (config?: AxisConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.axisGroup = this.g.append('g')
    this.gridGroup = this.g.append('g')
      .attr('class', s.grid)
  }

  /** Renders axis to an invisible grouped to calculate automatic chart margins */
  public preRender (): void {
    const { config } = this
    const axisRenderHelperGroup = this.g.append('g').attr('opacity', 0)

    this._renderAxis(axisRenderHelperGroup, 0)

    // Store axis raw BBox (without the label) for further label positioning (see _renderAxisLabel)
    this._axisRawBBox = axisRenderHelperGroup.node().getBBox()

    // Align tick text
    if (config.tickTextAlign) this._alignTickLabels()
    // Render label and store total axis size and required margins
    this._renderAxisLabel(axisRenderHelperGroup)
    this._axisSizeBBox = this._getAxisSize(axisRenderHelperGroup)
    this._requiredMargin = this._getRequiredMargin(this._axisSizeBBox)

    axisRenderHelperGroup.remove()
  }

  public getPosition (): Position {
    const { config: { type, position } } = this
    return (position ?? ((type === AxisType.X) ? Position.Bottom : Position.Left)) as Position
  }

  private _getAxisSize (selection: Selection<SVGGElement, unknown, SVGGElement, undefined>): SVGRect {
    const bBox = selection.node().getBBox()
    return bBox
  }

  private _getRequiredMargin (axisSize = this._axisSizeBBox): Spacing {
    const { config: { type, position } } = this

    switch (type) {
      case AxisType.X: {
        const tolerancePx = 1
        const xEnd = this._axisSizeBBox.x + this._axisSizeBBox.width

        const left = this._axisSizeBBox.x < 0 ? Math.abs(this._axisSizeBBox.x) : 0
        const right = (xEnd - this._width) > tolerancePx ? xEnd - this._width : 0

        switch (position) {
          case Position.Top: return { top: axisSize.height, left, right }
          case Position.Bottom: default: return { bottom: axisSize.height, left, right }
        }
      }
      case AxisType.Y: {
        const bleedY = axisSize.height > this._height ? (axisSize.height - this._height) / 2 : 0
        const top = bleedY
        const bottom = bleedY

        switch (position) {
          case Position.Right: return { right: axisSize.width, top, bottom }
          case Position.Left: default: return { left: axisSize.width, top, bottom }
        }
      }
    }
  }

  getRequiredMargin (): Spacing {
    return this._requiredMargin
  }

  /** Calculates axis transform:translate offset based on passed container margins */
  getOffset (containerMargin: Spacing): {left: number; top: number} {
    const { config: { type, position } } = this

    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return { top: containerMargin.top, left: containerMargin.left }
          case Position.Bottom: default: return { top: containerMargin.top + this._height, left: containerMargin.left }
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return { top: containerMargin.top, left: containerMargin.left + this._width }
          case Position.Left: default: return { top: containerMargin.top, left: containerMargin.left }
        }
    }
  }

  public _render (duration = this.config.duration, selection = this.axisGroup): void {
    const { config } = this

    this._renderAxis(selection, duration)
    this._renderAxisLabel(selection)

    if (config.gridLine) {
      const gridGen = this._buildGrid()
      // Interrupting all active transitions first to prevent them from being stuck.
      // Somehow we see it happening in Angular apps.
      this.gridGroup.selectAll('*').interrupt()
      smartTransition(this.gridGroup, duration).call(gridGen).style('opacity', 1)
    } else {
      smartTransition(this.gridGroup, duration).style('opacity', 0)
    }

    if (config.tickTextAlign) this._alignTickLabels()
    this._resolveTickLabelOverlap(selection)
  }

  private _buildAxis (): D3Axis<any> {
    const { config: { type, position, tickPadding } } = this

    const ticks = this._getNumTicks()
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return axisTop(this.xScale).ticks(ticks).tickPadding(tickPadding)
          case Position.Bottom: default: return axisBottom(this.xScale).ticks(ticks).tickPadding(tickPadding)
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return axisRight(this.yScale).ticks(ticks).tickPadding(tickPadding)
          case Position.Left: default: return axisLeft(this.yScale).ticks(ticks).tickPadding(tickPadding)
        }
    }
  }

  private _buildGrid (): D3Axis<NumberValue | Date> {
    const { config } = this

    let gridGen: D3Axis<NumberValue | Date>
    switch (config.type) {
      case AxisType.X:
        switch (config.position) {
          case Position.Top: { gridGen = axisTop(this.xScale); break }
          case Position.Bottom: default: { gridGen = axisBottom(this.xScale); break }
        }
        gridGen.tickSize(-this._height)
        break
      case AxisType.Y:
        switch (config.position) {
          case Position.Right: { gridGen = axisRight(this.yScale); break }
          case Position.Left: default: { gridGen = axisLeft(this.yScale); break }
        }
        gridGen.tickSize(-this._width)
    }
    gridGen
      .tickSizeOuter(0)
      .tickFormat(() => '')

    const numTicks = this._getNumTicks() * 2
    const gridScale = gridGen.scale<ContinuousScale>()
    const scaleDomain = gridScale.domain()

    const getGridMinMaxTicksOnlyValues = (): number[] | Date[] => {
      if (!config.minMaxTicksOnlyShowGridLines) return scaleDomain

      const tickValues = gridScale.ticks(numTicks)
      if (tickValues.length < 2) return scaleDomain

      // If the last tick is far enough from the domain max value, we add it to the tick values to draw the grid line
      const tickValuesStep = +tickValues[1] - +tickValues[0]
      const domainMaxValue = scaleDomain[1]
      const diff = +domainMaxValue - +tickValues[tickValues.length - 1]

      return diff > tickValuesStep / 2 ? [...tickValues, domainMaxValue] as (number[] | Date[]) : tickValues
    }

    const tickValues = config.tickValues
      ? this._getConfiguredTickValues()
      : this._shouldRenderMinMaxTicksOnly()
        ? getGridMinMaxTicksOnlyValues()
        : gridScale.ticks(numTicks)

    gridGen.tickValues(tickValues)

    return gridGen
  }

  private _renderAxis (selection = this.axisGroup, duration = this.config.duration): void {
    const { config } = this

    const axisGen = this._buildAxis()
    const axisScale = axisGen.scale<ContinuousScale>()
    const tickValues: (number[] | Date[]) =
      config.tickValues
        ? this._getConfiguredTickValues()
        : this._shouldRenderMinMaxTicksOnly()
          ? axisScale.domain()
          : axisScale.ticks(this._getNumTicks())
    const tickCount = tickValues.length
    axisGen.tickValues(tickValues)

    // Interrupting all active transitions first to prevent them from being stuck.
    // Somehow we see it happening in Angular apps.
    selection.selectAll('*').interrupt()
    const transition = smartTransition(selection, duration).call(axisGen)

    // Unset D3's default y and dy attributes because we're going to set them manually in the renderTextToSvgTextElement function
    selection.selectAll<SVGTextElement, number | Date>('text')
      .attr('dy', null)
      .attr('y', null)

    // Resolving tick label overlap after the animation is over
    transition.on('end', () => {
      this._resolveTickLabelOverlap(selection)
    })

    const ticks = selection.selectAll<SVGGElement, number | Date>('g.tick')

    ticks
      .classed(s.tick, true)
      .style('font-size', config.tickTextFontSize)

    // Selecting the <text> elements of the ticks to apply formatting. By default, this selection
    // will include exiting elements, so we're filtering them out.
    const tickText = selection.selectAll<SVGTextElement, number | Date>('g.tick > text')
      .filter(tickValue => tickValues.some((t: number | Date) => isEqual(tickValue, t))) // We use isEqual to compare Dates
      .classed(s.tickLabel, true)
      .classed(s.tickLabelHideable, Boolean(config.tickTextHideOverlapping))
      .style('fill', config.tickTextColor) as Selection<SVGTextElement, number, SVGGElement, unknown> | Selection<SVGTextElement, Date, SVGGElement, unknown>

    // Marking exiting elements
    selection.selectAll<SVGTextElement, number | Date>('g.tick > text')
      .filter(tickValue => !tickValues.some((t: number | Date) => isEqual(tickValue, t)))
      .classed(s.tickTextExiting, true)

    // We interrupt the transition on tick's <text> to make it 'wrappable'
    tickText.nodes().forEach(node => interrupt(node))

    const tickSize = axisGen.tickSize()
    const axisPosition = this.getPosition()
    const textMaxWidth = config.tickTextWidth || (config.type === AxisType.X ? this._containerWidth / (tickCount + 1) : this._containerWidth / 5)
    tickText.each((value: number | Date, i: number, elements: ArrayLike<SVGTextElement>) => {
      let text = config.tickFormat?.(value, i, tickValues) ?? `${value}`
      const textElement = elements[i] as SVGTextElement

      // Get and cache the tick text style
      if (!this._tickTextStyleCached) {
        const styleDeclaration = getComputedStyle(textElement)
        this._tickTextStyleCached = {
          fontSize: Number.parseFloat(styleDeclaration.fontSize),
          fontFamily: styleDeclaration.fontFamily,
          fontWidthToHeightRatio: getFontWidthToHeightRatio(),
        }
      }

      // Calculate the text offset based on the axis position and the tick size
      const [textOffsetX, textOffsetY] = this._getTickTextOffset(axisPosition, tickSize, this._tickTextStyleCached.fontSize)

      // Prepare the Unovis text options
      const textOptions: UnovisTextOptions = {
        verticalAlign: config.type === AxisType.X ? VerticalAlign.Top : VerticalAlign.Middle,
        width: textMaxWidth,
        textRotationAngle: config.tickTextAngle,
        separator: config.tickTextSeparator,
        wordBreak: config.tickTextForceWordBreak,
        x: textOffsetX,
        y: textOffsetY,
      }

      if (config.tickTextFitMode === FitMode.Trim) {
        const textElementSelection = select<SVGTextElement, string>(textElement).text(text)
        trimSVGText(textElementSelection, textMaxWidth, config.tickTextTrimType as TrimMode, true, this._tickTextStyleCached.fontSize, 0.58)
        text = select<SVGTextElement, string>(textElement).text()
      }

      const textBlock: UnovisText = { text, ...this._tickTextStyleCached }
      const dominantBaseline = config.type === AxisType.X ? 'central' : 'hanging'
      renderTextToSvgTextElement(textElement, textBlock, textOptions, dominantBaseline)
    })

    selection
      .classed(s.axis, true)
      .classed(s.hideTickLine, !config.tickLine)
      .classed(s.hideDomain, !config.domainLine)

    if (config.fullSize) {
      const path = this._getFullDomainPath(0)
      smartTransition(selection.select('.domain'), duration).attr('d', path)
    }
  }

  private _resolveTickLabelOverlap (selection = this.axisGroup): void {
    const { config } = this
    const tickTextSelection = selection.selectAll<SVGTextElement, number | Date>(`g.tick > text:not(.${s.tickTextExiting})`)

    if (!config.tickTextHideOverlapping) {
      tickTextSelection.style('opacity', null)
      return
    }

    cancelAnimationFrame(this._collideTickLabelsAnimFrameId)
    // Colliding labels in the next frame to prevent forced reflow
    this._collideTickLabelsAnimFrameId = requestAnimationFrame(() => {
      this._collideTickLabels(tickTextSelection)
    })
  }

  private _collideTickLabels (selection: Selection<SVGTextElement, number | Date, SVGGElement, unknown>): void {
    type SVGOverlappingTextElement = SVGTextElement & {
      _visible: boolean;
    }

    // Reset visibility of all labels
    selection.each((d, i, elements) => {
      const node = elements[i] as SVGOverlappingTextElement
      node._visible = true
    })

    // We do three iterations because not all overlapping labels can be resolved in the first iteration
    const numIterations = 3
    for (let i = 0; i < numIterations; i += 1) {
    // Run collision detection and set labels visibility
      selection.each((d, i, elements) => {
        const label1 = elements[i] as SVGOverlappingTextElement
        const isLabel1Visible = label1._visible
        if (!isLabel1Visible) return

        // Calculate bounding rect of point's label
        const label1BoundingRect = label1.getBoundingClientRect()

        for (let j = i + 1; j < elements.length; j += 1) {
          if (i === j) continue
          const label2 = elements[j] as SVGOverlappingTextElement
          const isLabel2Visible = label2._visible
          if (isLabel2Visible) {
            const label2BoundingRect = label2.getBoundingClientRect()
            const intersect = rectIntersect(label1BoundingRect, label2BoundingRect, -5)
            if (intersect) {
              label2._visible = false
              break
            }
          }
        }
      })
    }

    // Hide the overlapping labels
    selection.each((d, i, elements) => {
      const label = elements[i] as SVGOverlappingTextElement
      select(label).style('opacity', label._visible ? 1 : 0)
    })
  }

  private _getNumTicks (): number {
    const { config: { type, numTicks } } = this

    if (numTicks) return numTicks

    if (type === AxisType.X) {
      const xRange = this.xScale.range() as [number, number]
      const width = xRange[1] - xRange[0]
      return Math.floor(width / 175)
    }

    if (type === AxisType.Y) {
      const yRange = this.yScale.range() as [number, number]
      const height = Math.abs(yRange[0] - yRange[1])
      return Math.pow(height, 0.85) / 25
    }

    return this._defaultNumTicks
  }

  private _getConfiguredTickValues (): number[] | null {
    const { config } = this
    const scale = config.type === AxisType.X ? this.xScale : this.yScale
    const scaleDomain = scale?.domain() as [number, number]

    if (config.tickValues) {
      return config.tickValues.filter(v => (v >= scaleDomain[0]) && (v <= scaleDomain[1]))
    }

    return null
  }

  private _shouldRenderMinMaxTicksOnly (): boolean {
    const { config } = this
    return config.minMaxTicksOnly || (config.type === AxisType.X && this._width < config.minMaxTicksOnlyWhenWidthIsLess)
  }

  private _getFullDomainPath (tickSize = 0): string {
    const { config: { type } } = this
    switch (type) {
      case AxisType.X: return `M0.5, ${tickSize} V0.5 H${this._width + 0.5} V${tickSize}`
      case AxisType.Y: return `M${-tickSize}, ${this._height + 0.5} H0.5 V0.5 H${-tickSize}`
    }
  }

  private _renderAxisLabel (selection = this.axisGroup): void {
    const { type, label, labelMargin, labelFontSize, labelTextFitMode } = this.config

    // Remove the old label first to calculate the axis size properly
    selection.selectAll(`.${s.label}`).remove()

    if (!label) return

    // Calculate label position and rotation
    const axisPosition = this.getPosition()
    // We always use this.axisRenderHelperGroup to calculate the size of the axis because
    //    this.axisGroup will give us incorrect values due to animation
    const { width: axisWidth, height: axisHeight } = this._axisRawBBox ?? selection.node().getBBox()

    const rotation = type === AxisType.Y ? -90 : 0

    // Create the text element (without transform first)
    const textElement = selection
      .append('text')
      .attr('class', s.label)
      .attr('dy', `${this._getLabelDY()}em`)
      .style('font-size', labelFontSize)
      .style('fill', this.config.labelColor)

    // Set the text content
    textElement.text(label)

    let isWrapped = false
    if (labelTextFitMode === FitMode.Wrap) {
      // For Y-axis, use the chart height as the maximum width before rotation
      const maxWidth = type === AxisType.Y ? this._height : this._width
      const currentTextWidth = textElement.node().getComputedTextLength()

      if (currentTextWidth > maxWidth) {
        wrapSVGText(textElement, maxWidth)
        isWrapped = true
      }
    }

    // Calculate offset after wrapping to get accurate dimensions
    let labelWidth = axisWidth
    let labelHeight = axisHeight
    if (labelTextFitMode === FitMode.Wrap) {
      const labelBBox = textElement.node().getBBox()
      labelWidth = labelBBox.width
      labelHeight = labelBBox.height
    } else {
      const trimWidth = type === AxisType.X ? labelWidth : labelHeight
      const styleDeclaration = getComputedStyle(textElement.node())
      const fontSize = Number.parseFloat(styleDeclaration.fontSize)
      // Use the default fontWidthToHeightRatio
      trimSVGText(
        textElement,
        trimWidth,
        this.config.labelTextTrimType as TrimMode,
        true,
        fontSize
      )
      const trimmedBBox = textElement.node().getBBox()
      labelWidth = trimmedBBox.width
      labelHeight = trimmedBBox.height
    }

    /*
      we need to calculate the offset for the label based on the position and the fit mode
      for offsetX, applying Y label we need to check if it's wrap or trim, then set the offset accordingly.
      Same for offsetY, need to consider x label.
    */
    const offsetX = type === AxisType.X
      ? this._width / 2
      : type === AxisType.Y && labelTextFitMode === FitMode.Wrap && isWrapped
        ? (axisPosition === Position.Left)
          ? -axisWidth - labelHeight / 2 - 10 // there's a 10px gap between tick label and Position.Right Y label, so offset as well in the Position.Left case
          : axisWidth
        : (-1) ** (+(axisPosition === Position.Left)) * axisWidth
    const offsetY = type === AxisType.Y
      ? this._height / 2
      : type === AxisType.X && labelTextFitMode === FitMode.Wrap
        ? (axisPosition === Position.Top) ? -axisHeight - labelHeight / 2 : axisHeight
        : (-1) ** (+(axisPosition === Position.Top)) * axisHeight

    const marginX = type === AxisType.X ? 0 : (-1) ** (+(axisPosition === Position.Left)) * labelMargin
    const marginY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.Top)) * labelMargin : 0

    // Apply transform and rotation after all calculations
    textElement.attr('transform', `translate(${offsetX + marginX},${offsetY + marginY}) rotate(${rotation})`)
  }

  private _getLabelDY (): number {
    const { type, position } = this.config
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return 0
          case Position.Bottom: default: return 0.75
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return 0.75
          case Position.Left: default: return -0.25
        }
    }
  }

  private _getTickTextOffset (axisPosition: Position, tickSize: number, fontSize: number): [number, number] {
    const { config } = this
    const angleRad = (config.tickTextAngle ?? 0) / 180 * Math.PI
    const baseOffset = tickSize + config.tickPadding

    if (config.type === AxisType.X) {
      const direction = axisPosition === Position.Bottom ? 1 : -1
      return [
        direction * baseOffset * Math.sin(angleRad),
        direction * (baseOffset + fontSize / 2) * Math.cos(angleRad),
      ]
    } else {
      const direction = axisPosition === Position.Right ? 1 : -1
      return [
        direction * baseOffset * Math.cos(angleRad),
        direction * baseOffset * Math.sin(angleRad),
      ]
    }
  }

  private _alignTickLabels (): void {
    const { config: { type, tickTextAlign, tickTextAngle, position } } = this
    const tickText = this.g.selectAll('g.tick > text')

    const textAnchor = textAlignToAnchor(tickTextAlign as TextAlign)
    const translateX = type === AxisType.X
      ? 0
      : this._getYTickTextTranslate(tickTextAlign as TextAlign, position as Position)

    const translateValue = tickTextAngle ? `translate(${translateX},0) rotate(${tickTextAngle})` : `translate(${translateX},0)`
    tickText
      .attr('transform', translateValue)
      .attr('text-anchor', textAnchor)
  }

  private _getYTickTextTranslate (textAlign: TextAlign, axisPosition: Position = Position.Left): number {
    /*
      Default in D3 is 9, tickPadding is the spacing in pixels between the tick and it's label. Default: `8`
    */
    const defaultTickTextSpacingPx = this.config.tickPadding + 1

    // this._axisRawBBox will be undefined when autoMargin is undefined
    const width = (this._axisRawBBox?.width ?? this.axisGroup.node()?.getBBox().width ?? 0) - defaultTickTextSpacingPx

    switch (textAlign) {
      case TextAlign.Left: return axisPosition === Position.Left ? width * -1 : 0
      case TextAlign.Right: return axisPosition === Position.Left ? 0 : width
      case TextAlign.Center: return axisPosition === Position.Left ? width * (-0.5) : width * 0.5
      default: return 0
    }
  }
}
