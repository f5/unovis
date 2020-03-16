// Copyright (c) Volterra, Inc. All rights reserved.

import { select, Selection } from 'd3-selection'
import { interrupt } from 'd3-transition'
import { axisLeft, axisTop, axisRight, axisBottom, Axis as D3Axis } from 'd3-axis'

// Core
import { XYComponentCore } from 'core/xy-component'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { Spacing } from 'types/misc'

// Utils
import { smartTransition } from 'utils/d3'

// Config
import { AxisConfig, AxisConfigInterface } from './config'

// Modules
import { wrapTickText, getWrapOptions } from './modules/tick'

// Styles
import * as s from './style'

export class Axis<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: AxisConfig<Datum> = new AxisConfig<Datum>()
  axisGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  gridGroup: Selection<SVGGElement, object[], SVGGElement, object[]>

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

  /** Renders axis to an invisible groupd to calculate automatic chart margins */
  preRender (): void {
    const axisRenderHelperGroup = this.g.append('g').attr('opacity', 0)

    this._renderAxis(axisRenderHelperGroup, 0)
    this._updateTicks(axisRenderHelperGroup)

    // Store axis raw BBox (without the label) for further label positioning (see _renderAxisLabel)
    this._axisRawBBox = axisRenderHelperGroup.node().getBBox()

    // Render label and store total axis size and reqired margins
    this._renderAxisLabel(axisRenderHelperGroup)
    this._axisSize = this._getSize(axisRenderHelperGroup)
    this._requiredMargin = this._getRequiredMargin(this._axisSize)

    axisRenderHelperGroup.remove()
  }

  getPosition (): Position {
    const { config: { type, position } } = this
    return (position ?? ((type === AxisType.X) ? Position.BOTTOM : Position.LEFT)) as Position
  }

  _getSize (selection): { width: number; height: number } {
    const { padding } = this.config
    const { width, height } = selection.node().getBBox()

    return {
      width: width + padding.left + padding.right,
      height: height + padding.top + padding.bottom,
    }
  }

  _getRequiredMargin (axisSize = this._axisSize): Spacing {
    const { config: { type, position, padding, width, height } } = this

    const bleedX = axisSize.width > width ? (axisSize.width - width) / 2 : 0
    const bleedY = axisSize.height > height ? (axisSize.height - height) / 2 : 0

    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return { top: axisSize.height, left: padding.left + bleedX, right: padding.right + bleedX }
      case Position.BOTTOM: default: return { bottom: axisSize.height, left: padding.left + bleedX, right: padding.right + bleedX }
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return { right: axisSize.width, top: padding.top + bleedY, bottom: padding.bottom + bleedY }
      case Position.LEFT: default: return { left: axisSize.width, top: padding.top + bleedY, bottom: padding.bottom + bleedY }
      }
    }
  }

  getRequiredMargin (): Spacing {
    return this._requiredMargin
  }

  /** Calculates axis transform:translate offset based on passed container margins */
  getOffset (containerMargin: Spacing): {left: number; top: number} {
    const { config: { type, position, padding, width, height } } = this

    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return { top: containerMargin.top - padding.top, left: containerMargin.left }
      case Position.BOTTOM: default: return { top: containerMargin.top + height + padding.top, left: containerMargin.left }
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return { top: containerMargin.top, left: containerMargin.left + width + padding.left }
      case Position.LEFT: default: return { top: containerMargin.top, left: containerMargin.left - padding.right }
      }
    }
  }

  _render (duration = this.config.duration, selection = this.axisGroup): void {
    const { config } = this

    this._renderAxis(selection, duration)
    this._updateTicks(selection)
    this._renderAxisLabel(selection)

    if (config.gridLine) {
      const gridGen = this._buildGrid().tickFormat(() => '')
      smartTransition(this.gridGroup, duration).call(gridGen).style('opacity', 1)
    } else {
      smartTransition(this.gridGroup, duration).style('opacity', 0)
    }
  }

  _buildAxis (): D3Axis<any> {
    const { config: { type, scales, position } } = this

    const ticks = this._getNumTicks()
    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return axisTop(scales.x).ticks(ticks)
      case Position.BOTTOM: default: return axisBottom(scales.x).ticks(ticks)
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return axisRight(scales.y).ticks(ticks)
      case Position.LEFT: default: return axisLeft(scales.y).ticks(ticks)
      }
    }
  }

  _buildGrid (): D3Axis<any> {
    const { config: { type, scales, position, width, height } } = this

    const ticks = this._getNumTicks()
    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return axisTop(scales.x).ticks(ticks * 2).tickSize(-height).tickSizeOuter(0)
      case Position.BOTTOM: default: return axisBottom(scales.x).ticks(ticks * 2).tickSize(-height).tickSizeOuter(0)
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return axisRight(scales.y).ticks(ticks * 2).tickSize(-width).tickSizeOuter(0)
      case Position.LEFT: default: return axisLeft(scales.y).ticks(ticks * 2).tickSize(-width).tickSizeOuter(0)
      }
    }
  }

  _renderAxis (selection = this.axisGroup, duration = this.config.duration): void {
    const { config } = this

    const axisGen = this._buildAxis()
    if (config.tickFormat) axisGen.tickFormat(config.tickFormat)
    if (config.tickValues) axisGen.tickValues(this._getTickValues())

    smartTransition(selection, duration).call(axisGen)

    const ticks = selection.selectAll('g.tick')

    ticks
      .classed(s.tick, true)
      .style('font-size', config.tickLabelFontSize)

    // We interrupt transition on tick Text to make it 'wrappable'
    const tickText = ticks.selectAll('text')
    tickText.nodes().forEach(node => interrupt(node))
    tickText.text(d => config.tickFormat?.(d) ?? d)
    tickText
      .call(wrapTickText, getWrapOptions(ticks, config))

    selection
      .classed(s.axis, true)
      .classed('hide-tick-line', !config.tickLine)
      .classed('hide-domain', !config.domainLine)

    if (config.fullSize) {
      const path = this._getFullDomainPath(0)
      smartTransition(selection.select('.domain'), duration).attr('d', path)
    }
  }

  _updateTicks (selection = this.axisGroup): void {
    const { config } = this
    const ticks = selection.selectAll('g.tick')

    const renderOnlyFirstAndLast = config.minMaxTicksOnly && !config.showAllTicks

    if (renderOnlyFirstAndLast) {
      ticks.each((d, i, elements) => {
        if (i > 0 && i < elements.length - 1) select(elements[i]).remove()
      })
    }
  }

  _getNumTicks (): number {
    const { config: { type, numTicks, width, height } } = this
    return numTicks ?? Math.floor((type === AxisType.X ? width / 175 : height / 60))
  }

  _getTickValues (): number[] {
    const { config: { scales, tickValues, type } } = this
    const scaleDomain = type === AxisType.X ? scales.x?.domain() : scales.y?.domain()

    return tickValues.filter(v => (v >= scaleDomain[0]) && (v <= scaleDomain[1]))
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

    // Lalculate label position and rotation
    const axisPosition = this.getPosition()
    // We always use this.axisRenderHelperGroup to calculate the size of the axis because
    //    this.gaxisGroup will give us incorrrect values due to animation
    const { width: axisWidth, height: axisHeight } = this._axisRawBBox ?? selection.node().getBBox()

    const offsetX = type === AxisType.X ? width / 2 : (-1) ** (+(axisPosition === Position.LEFT)) * axisWidth
    const offsetY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.TOP)) * axisHeight : height / 2

    const marginX = type === AxisType.X ? 0 : (-1) ** (+(axisPosition === Position.LEFT)) * labelMargin
    const marginY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.TOP)) * labelMargin : 0

    const rotation = type === AxisType.Y ? -90 : 0

    // Apped new label
    selection
      .append('text')
      .attr('class', s.label)
      .text(label)
      .style('font-size', labelFontSize)
      .attr('dy', `${this._getLabelHangingTextValue()}em`)
      .attr('transform', `translate(${offsetX + marginX},${offsetY + marginY}) rotate(${rotation})`)
  }

  _getLabelHangingTextValue () {
    const { type, position } = this.config
    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return 0
      case Position.BOTTOM: default: return 0.75
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return 0.75
      case Position.LEFT: default: return -0.25
      }
    }
  }

  _toggleTickFullText (tickElement, fullIsActive: boolean): void {
    const tickText = tickElement.select(`.${s.tickText}`)
    const fullTickText = tickElement.select(`.${s.fullTickText}`)

    if (!fullTickText.node()) return
    tickText.classed('active', !fullIsActive)
    fullTickText.classed('active', fullIsActive)
  }

  _onTickMouseOver (d: any, i: number, elements: []): void {
    if (!this.config.tickTextExpandOnHover) return
    this._toggleTickFullText(select(elements[i]), true)
  }

  _onTickMouseOut (d: any, i: number, elements: []): void {
    if (!this.config.tickTextExpandOnHover) return
    this._toggleTickFullText(select(elements[i]), false)
  }
}
