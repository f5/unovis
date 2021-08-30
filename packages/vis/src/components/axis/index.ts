// Copyright (c) Volterra, Inc. All rights reserved.

import { Selection } from 'd3-selection'
import { interrupt } from 'd3-transition'
import { axisLeft, axisTop, axisRight, axisBottom, Axis as D3Axis } from 'd3-axis'

// Core
import { XYComponentCore } from 'core/xy-component'

// Types
import { Position } from 'types/position'
import { Spacing } from 'types/spacing'
import { TextAlign } from 'types/text'

// Utils
import { smartTransition } from 'utils/d3'

// Local Types
import { AxisType } from './types'

// Config
import { AxisConfig, AxisConfigInterface } from './config'

// Modules
import { wrapTickText, getWrapOptions } from './modules/tick'

// Styles
import * as s from './style'

export class Axis<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: AxisConfig<Datum> = new AxisConfig<Datum>()
  axisGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  gridGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>

  private _axisRawBBox: DOMRect
  private _axisSize: { width: number; height: number }
  private _requiredMargin: Spacing

  events = {
    [Axis.selectors.tick]: {
      mouseover: this._onTickMouseOver.bind(this),
      mouseout: this._onTickMouseOut.bind(this),
    },
  }

  constructor (config?: AxisConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    this.axisGroup = this.g.append('g')
    this.gridGroup = this.g.append('g')
      .attr('class', s.grid)
  }

  /** Renders axis to an invisible grouped to calculate automatic chart margins */
  preRender (): void {
    const { config } = this
    const axisRenderHelperGroup = this.g.append('g').attr('opacity', 0)

    this._renderAxis(axisRenderHelperGroup, 0)

    // Store axis raw BBox (without the label) for further label positioning (see _renderAxisLabel)
    this._axisRawBBox = axisRenderHelperGroup.node().getBBox()

    // Align tick text
    if (config.tickTextAlign) this._alignTickLabels()

    // Render label and store total axis size and required margins
    this._renderAxisLabel(axisRenderHelperGroup)
    this._axisSize = this._getSize(axisRenderHelperGroup)
    this._requiredMargin = this._getRequiredMargin(this._axisSize)

    axisRenderHelperGroup.remove()
  }

  getPosition (): Position {
    const { config: { type, position } } = this
    return (position ?? ((type === AxisType.X) ? Position.Bottom : Position.Left)) as Position
  }

  _getSize (selection): { width: number; height: number } {
    const { width, height } = selection.node().getBBox()

    return {
      width: width,
      height: height,
    }
  }

  _getRequiredMargin (axisSize = this._axisSize): Spacing {
    const { config: { type, position, width, height, tickTextAlign } } = this

    switch (type) {
      case AxisType.X: {
        const bleedX = axisSize.width > width ? (axisSize.width - width) / 2 : 0
        const left = ((tickTextAlign === TextAlign.Left) ? 0
          : (tickTextAlign === TextAlign.Right) ? 2 * bleedX
            : bleedX)

        const right = ((tickTextAlign === TextAlign.Left) ? 2 * bleedX
          : (tickTextAlign === TextAlign.Right) ? 0
            : bleedX)

        switch (position) {
          case Position.Top: return { top: axisSize.height, left, right }
          case Position.Bottom: default: return { bottom: axisSize.height, left, right }
        }
      }
      case AxisType.Y: {
        const bleedY = axisSize.height > height ? (axisSize.height - height) / 2 : 0
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
    const { config: { type, position, width, height } } = this

    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return { top: containerMargin.top, left: containerMargin.left }
          case Position.Bottom: default: return { top: containerMargin.top + height, left: containerMargin.left }
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return { top: containerMargin.top, left: containerMargin.left + width }
          case Position.Left: default: return { top: containerMargin.top, left: containerMargin.left }
        }
    }
  }

  _render (duration = this.config.duration, selection = this.axisGroup): void {
    const { config } = this

    this._renderAxis(selection, duration)
    this._renderAxisLabel(selection)

    if (config.gridLine) {
      const gridGen = this._buildGrid().tickFormat(() => '')
      gridGen.tickValues(this._getConfiguredTickValues())
      smartTransition(this.gridGroup, duration).call(gridGen).style('opacity', 1)
    } else {
      smartTransition(this.gridGroup, duration).style('opacity', 0)
    }

    if (config.tickTextAlign) this._alignTickLabels()
  }

  _buildAxis (): D3Axis<any> {
    const { config: { type, scales, position } } = this

    const ticks = this._getNumTicks()
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return axisTop(scales.x).ticks(ticks)
          case Position.Bottom: default: return axisBottom(scales.x).ticks(ticks)
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return axisRight(scales.y).ticks(ticks)
          case Position.Left: default: return axisLeft(scales.y).ticks(ticks)
        }
    }
  }

  _buildGrid (): D3Axis<any> {
    const { config: { type, scales, position, width, height } } = this

    const ticks = this._getNumTicks()
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return axisTop(scales.x).ticks(ticks * 2).tickSize(-height).tickSizeOuter(0)
          case Position.Bottom: default: return axisBottom(scales.x).ticks(ticks * 2).tickSize(-height).tickSizeOuter(0)
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return axisRight(scales.y).ticks(ticks * 2).tickSize(-width).tickSizeOuter(0)
          case Position.Left: default: return axisLeft(scales.y).ticks(ticks * 2).tickSize(-width).tickSizeOuter(0)
        }
    }
  }

  _renderAxis (selection = this.axisGroup, duration = this.config.duration): void {
    const { config } = this

    const axisGen = this._buildAxis()
    axisGen.tickValues(this._getConfiguredTickValues())

    smartTransition(selection, duration).call(axisGen)

    const ticks = selection.selectAll('g.tick')
    const tickValues = ticks.data()

    ticks
      .classed(s.tick, true)
      .style('font-size', config.tickTextFontSize)

    // We interrupt transition on tick Text to make it 'wrappable'
    const tickText = selection.selectAll('g.tick > text')
    tickText.nodes().forEach(node => interrupt(node))
    tickText.text((value, i) => config.tickFormat?.(value, i, tickValues) ?? value)
    tickText
      .call(wrapTickText, getWrapOptions(ticks, config))

    selection
      .classed(s.axis, true)
      .classed(s.hideTickLine, !config.tickLine)
      .classed(s.hideDomain, !config.domainLine)

    if (config.fullSize) {
      const path = this._getFullDomainPath(0)
      smartTransition(selection.select('.domain'), duration).attr('d', path)
    }
  }

  _getNumTicks (): number {
    const { config: { type, numTicks, width, height } } = this
    return numTicks ?? Math.floor((type === AxisType.X ? width / 175 : Math.pow(height, 0.85) / 25))
  }

  _getConfiguredTickValues (): number[] | null {
    const { config: { scales, tickValues, type, minMaxTicksOnly } } = this
    const scale = type === AxisType.X ? scales.x : scales.y
    const scaleDomain = scale?.domain()

    if (minMaxTicksOnly) {
      return scaleDomain as number[]
    }

    if (tickValues) {
      return tickValues.filter(v => (v >= scaleDomain[0]) && (v <= scaleDomain[1]))
    }

    return null
  }

  _getFullDomainPath (tickSize = 0): string {
    const { config: { type, width, height } } = this
    switch (type) {
      case AxisType.X: return `M0.5, ${tickSize} V0.5 H${width + 0.5} V${tickSize}`
      case AxisType.Y: return `M${-tickSize}, ${height + 0.5} H0.5 V0.5 H${-tickSize}`
    }
  }

  _renderAxisLabel (selection = this.axisGroup): void {
    const { type, label, width, height, labelMargin, labelFontSize } = this.config

    // Remove the old label first to calculate the axis size properly
    selection.selectAll(`.${s.label}`).remove()

    // Calculate label position and rotation
    const axisPosition = this.getPosition()
    // We always use this.axisRenderHelperGroup to calculate the size of the axis because
    //    this.axisGroup will give us incorrect values due to animation
    const { width: axisWidth, height: axisHeight } = this._axisRawBBox ?? selection.node().getBBox()

    const offsetX = type === AxisType.X ? width / 2 : (-1) ** (+(axisPosition === Position.Left)) * axisWidth
    const offsetY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.Top)) * axisHeight : height / 2

    const marginX = type === AxisType.X ? 0 : (-1) ** (+(axisPosition === Position.Left)) * labelMargin
    const marginY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.Top)) * labelMargin : 0

    const rotation = type === AxisType.Y ? -90 : 0

    // Append new label
    selection
      .append('text')
      .attr('class', s.label)
      .text(label)
      .style('font-size', labelFontSize)
      .attr('dy', `${this._getLabelDY()}em`)
      .attr('transform', `translate(${offsetX + marginX},${offsetY + marginY}) rotate(${rotation})`)
  }

  _getLabelDY (): number {
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

  _alignTickLabels (): void {
    const { config: { type, tickTextAlign, position } } = this

    const tickText = this.g.selectAll('g.tick > text')
    const textAnchor = this._getTickTextAnchor(tickTextAlign)
    const translateX = type === AxisType.X ? 0 : this._getYTickTextTranslate(tickTextAlign, position)

    tickText
      .attr('text-anchor', textAnchor)
      .attr('transform', `translate(${translateX},0)`)
  }

  _getTickTextAnchor (textAlign: TextAlign): string {
    switch (textAlign) {
      case TextAlign.Left: return 'start'
      case TextAlign.Right: return 'end'
      case TextAlign.Center: return 'middle'
      default: return null
    }
  }

  _getYTickTextTranslate (textAlign: TextAlign, axisPosition: Position = Position.Left): number {
    const defaultTickTextSpacingPx = 9 // Default in D3
    const width = this._axisRawBBox.width - defaultTickTextSpacingPx

    switch (textAlign) {
      case TextAlign.Left: return axisPosition === Position.Left ? width * -1 : 0
      case TextAlign.Right: return axisPosition === Position.Left ? 0 : width
      case TextAlign.Center: return axisPosition === Position.Left ? width * (-0.5) : width * 0.5
      default: return 0
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onTickMouseOver (d: any, event: MouseEvent): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onTickMouseOut (d: any, event: MouseEvent): void {
  }
}
