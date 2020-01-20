// Copyright (c) Volterra, Inc. All rights reserved.

import { select, Selection } from 'd3-selection'
import { axisLeft, axisTop, axisRight, axisBottom, Axis as D3Axis } from 'd3-axis'

// Core
import { XYComponentCore } from 'core/xy-component'

// Types
import { AxisType } from 'types/axis'
import { Position } from 'types/position'
import { Margin } from 'types/misc'

// Utils
import { clean } from 'utils/data'

// Config
import { AxisConfig, AxisConfigInterface } from './config'

// Modules
import { wrapTickText, getWrapOptions } from './modules/tick'

// Styles
import * as s from './style'

export class Axis<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: AxisConfig<Datum> = new AxisConfig()
  axisGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  axisLabGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  labelGroup: Selection<SVGGElement, object[], SVGGElement, object[]>
  _autoMargin = false
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
    this.labelGroup = this.g.append('g')
  }

  preRender (): void {
    this._render(0)
  }

  getPosition (): Position {
    const { config: { type, position } } = this
    return (position ?? ((type === AxisType.X) ? Position.BOTTOM : Position.LEFT)) as Position
  }

  getSize (): { width: number; height: number } {
    const { padding } = this.config
    const { width, height } = this.element.getBBox()

    return {
      width: width + padding.left + padding.right,
      height: height + padding.top + padding.bottom,
    }
  }

  calculateMargin (): Margin {
    const { config: { type, position, padding } } = this
    const size = this.getSize()

    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return { top: size.height, left: padding.left, right: padding.right }
      case Position.BOTTOM: default: return { bottom: size.height, left: padding.left, right: padding.right }
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return { right: size.width, top: padding.top, bottom: padding.bottom }
      case Position.LEFT: default: return { left: size.width, top: padding.top, bottom: padding.bottom }
      }
    }
  }

  getOffset (containerMargin: Margin): {left: number; top: number} {
    const { config: { type, position, padding, width, height } } = this

    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return { top: containerMargin.top - padding.top, left: padding.left }
      case Position.BOTTOM: default: return { top: containerMargin.top + height + padding.top, left: containerMargin.left }
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return { top: containerMargin.top, left: containerMargin.left + width + padding.left }
      case Position.LEFT: default: return { top: containerMargin.top, left: containerMargin.left - padding.right }
      }
    }
  }

  _render (customDuration?: number): void {
    const { config } = this
    // const duration = isNumber(customDuration) ? customDuration : config.duration
    const axisGen = this._buildAxis()
    if (config.tickFormat) axisGen.tickFormat(config.tickFormat)
    if (config.tickValues) axisGen.tickValues(config.tickValues)

    this.axisGroup.call(axisGen)

    const ticks = this.axisGroup.selectAll('g.tick')

    ticks
      .classed(s.tick, true)
      .call(wrapTickText, getWrapOptions(ticks, config, this._autoMargin))

    this.axisGroup
      .classed(s.axis, true)
      .classed('hide-grid-line', !config.gridLine)
      .classed('hide-tick-line', !config.tickLine)

    this._updateTicks()
    this._renderAxisLabel()
  }

  _buildAxis (): D3Axis<any> {
    const { config: { type, scales, position } } = this

    switch (type) {
    case AxisType.X:
      switch (position) {
      case Position.TOP: return axisTop(scales.x)
      case Position.BOTTOM: default: return axisBottom(scales.x)
      }
    case AxisType.Y:
      switch (position) {
      case Position.RIGHT: return axisRight(scales.y)
      case Position.LEFT: default: return axisLeft(scales.y)
      }
    }
  }

  _updateTicks (): void {
    const { config } = this
    const ticks = this.axisGroup.selectAll('g.tick')

    const renderOnlyFirstAndLast = config.minMaxTicksOnly && !config.showAllTicks

    if (renderOnlyFirstAndLast) {
      ticks.each((d, i, elements) => {
        if (i > 0 && i < elements.length - 1) select(elements[i]).remove()
      })
    }
  }

  _renderAxisLabel (): void {
    const { type, label } = this.config

    const axisPosition = this.getPosition()
    const { width, height } = this.axisGroup.node().getBBox()

    const labels = this.labelGroup.selectAll(`.${s.label}`).data(clean([label])) as Selection<SVGTextElement, any, SVGGElement, object[]>
    labels.exit().remove()

    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', `${s.label} ${axisPosition}`)

    const labelMerged = labelsEnter.merge(labels)

    const offsetX = type === AxisType.X ? width / 2 : (-1) ** (+(axisPosition === Position.LEFT)) * width
    const offsetY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.TOP)) * height : height / 2
    const rotation = type === AxisType.Y ? 90 : 0

    labelMerged.text(d => d)
      .classed(axisPosition, true)
      .attr('transform', `translate(${offsetX},${offsetY}) rotate(${rotation})`)
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
