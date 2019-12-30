// Copyright (c) Volterra, Inc. All rights reserved.

import { select } from 'd3-selection'
import { axisLeft, axisTop, axisRight, axisBottom } from 'd3-axis'

// Core
import { XYCore } from 'core/xy-component'

// Utils
import { Margin } from 'utils/types'
import { wrapTickText } from './modules/tick'

// Enums

// Config
import { AxisConfig, AxisConfigInterface } from './config'

// Styles
import * as s from './style'

export class Axis extends XYCore {
  static selectors = s
  config: AxisConfig = new AxisConfig()
  axisGroup: any
  labelGroup: any
  compositeContainerMargin: Margin
  events = {
    [Axis.selectors.tick]: {
      mouseover: this._onTickMouseOver.bind(this),
      mouseout: this._onTickMouseOut.bind(this),
    },
  }

  constructor (config?: AxisConfigInterface) {
    super()
    if (config) this.config.init(config)
    this.axisGroup = this.g.append('g')
    this.labelGroup = this.g.append('g')
    this.compositeContainerMargin = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  setCompositeContainerMargin (margin) {
    this.compositeContainerMargin = margin
  }

  getSize () {
    const { type, position, padding } = this.config
    const { width, height } = this.element.getBBox()
    switch (type) {
    case 'x': {
      switch (position) {
      case 'top': {
        return { top: height + padding.top + padding.bottom, left: padding.left, right: padding.right }
      }
      case 'bottom':
      default: {
        return { bottom: height + padding.top + padding.bottom, left: padding.left, right: padding.right }
      }
      }
    }
    case 'y': {
      switch (position) {
      case 'right': {
        return { right: width + padding.left + padding.right, top: padding.top, bottom: padding.bottom }
      }
      case 'left':
      default: {
        return { left: width + padding.left + padding.right, top: padding.top, bottom: padding.bottom }
      }
      }
    }
    }
  }

  prerender () {
    this._render(0, true)
  }

  _render (customDuration?: number, forceWrap?: boolean): void {
    const { config } = this
    // const duration = isNumber(customDuration) ? customDuration : config.duration
    this.axisGroup.call(this._getAxis())
    this.axisGroup.selectAll('g.tick')
      .classed(s.tick, true)
      .call(wrapTickText, this._getWrapLabelOption(forceWrap), () => {
        this._renderLabel()
      })
    this.axisGroup
      .classed(s.axis, true)
      .classed('hide-grid-line', !config.gridLine)
      .classed('hide-tick-line', !config.tickLine)

    this._updateTicksNumber()
  }

  _getAxis () {
    const { type, position, padding, scales, height, width } = this.config
    const margin = this.compositeContainerMargin
    switch (type) {
    case 'x': {
      switch (position) {
      case 'top': {
        this.g.attr('transform', `translate(${margin.left}, ${margin.top - padding.top})`)
        return axisTop(scales.x)
      }
      case 'bottom':
      default: {
        this.g.attr('transform', `translate(${margin.left}, ${height + margin.top + padding.top})`)
        return axisBottom(scales.x)
      }
      }
    }
    case 'y': {
      switch (position) {
      case 'right': {
        this.g.attr('transform', `translate(${width + margin.left + padding.left}, ${margin.top})`)
        return axisRight(scales.y)
      }
      case 'left':
      default: {
        this.g.attr('transform', `translate(${margin.left - padding.left}, ${margin.top})`)
        return axisLeft(scales.y)
      }
      }
    }
    }
  }

  /**
   * Dynamically updates the number of axis ticks to avoid text overlapping.
   */
  _updateTicksNumber () {
    const { config } = this
    const ticks = this.axisGroup.selectAll('g.tick')
    let renderOnlyFirstAndLast = false
    if (config.minMaxTicksOnly) {
      renderOnlyFirstAndLast = true
    } else if (!config.showAllTicks) {

    }

    if (renderOnlyFirstAndLast) {
      ticks.each((d, i, elements) => {
        if (i > 0 && i < elements.length - 1) select(elements[i]).remove()
      })
    }
  }

  _renderLabel () {
    const { position, type, label } = this.config
    if (!label) return
    const { width, height } = this.axisGroup.node().getBBox()
    const labels = this.labelGroup.selectAll(`.${s.label}`).data([label])
    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', s.label)
    const labelMerged = labelsEnter.merge(labels)
    labels.exit().remove()
    labelMerged
      .text(d => d)

    switch (type) {
    case 'x': {
      switch (position) {
      case 'top': {
        labelMerged.attr('transform', `translate(${width / 2}, ${-height})rotate(${type === 'y' ? 90 : 0})`)
        break
      }
      case 'bottom':
      default: {
        labelMerged
          .classed('bottom', true)
          .attr('transform', `translate(${width / 2}, ${height})rotate(${type === 'y' ? 90 : 0})`)
        break
      }
      }
      break
    }
    case 'y': {
      switch (position) {
      case 'right': {
        labelMerged
          .classed('right', true)
          .attr('transform', `translate(${width}, ${height / 2})rotate(${type === 'y' ? 90 : 0})`)
        break
      }
      case 'left':
      default: {
        labelMerged
          .classed('left', true)
          .attr('transform', `translate(${-width}, ${height / 2})rotate(${type === 'y' ? 90 : 0})`)
        break
      }
      }
      break
    }
    }
  }

  _getWrapLabelOption (forceWrap?: boolean) {
    const { compositeContainerMargin } = this
    const { type, position, tickTextLength, tickTextWidth, tickTextSeparator, tickTextForceWordBreak, tickTextTrimType, tickTextFitMode, width, padding } = this.config

    const ticksElements = this.axisGroup.selectAll('g.tick')
    let wrapWidth = tickTextWidth
    if (!wrapWidth) {
      if (type === 'x') {
        wrapWidth = width / ticksElements.size()
      } else {
        wrapWidth = position === 'right' ? compositeContainerMargin.right - padding.left - padding.right : compositeContainerMargin.left
      }
    }

    let verticalAlign = 'middle'
    if (type === 'x') {
      verticalAlign = position === 'top' ? 'top' : 'bottom'
    }

    return {
      width: wrapWidth,
      separator: tickTextSeparator,
      wordBreak: tickTextForceWordBreak,
      length: tickTextLength,
      trimType: tickTextTrimType,
      trimOnly: tickTextFitMode === 'trim',
      dy: type === 'x' ? 0.71 : 0.32,
      verticalAlign,
      forceWrap,
      tickTextFitMode,
    }
  }

  _toggleText (tickElement, fullIsActive) {
    const tickText = tickElement.select(`.${s.tickText}`)
    const fullTickText = tickElement.select(`.${s.fullTickText}`)

    if (!fullTickText.node()) return
    tickText.classed('active', !fullIsActive)
    fullTickText.classed('active', fullIsActive)
  }

  _onTickMouseOver (d, i, elements) {
    if (!this.config.tickTextExpandOnHover) return
    this._toggleText(select(elements[i]), true)
  }

  _onTickMouseOut (d, i, elements) {
    if (!this.config.tickTextExpandOnHover) return
    this._toggleText(select(elements[i]), false)
  }
}
