// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection, event } from 'd3-selection'
import { drag } from 'd3-drag'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
// import { Curve, CurveType } from 'types/curves'
// import { NumericAccessor } from 'types/misc'

// Config
import { TimelineConfig, TimelineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Timeline<Datum> extends XYComponentCore<Datum> {
  static selectors = s
  config: TimelineConfig<Datum> = new TimelineConfig()
  events = {
    [Timeline.selectors.background]: {
      wheel: this._onMouseWheel.bind(this),
    },
  }

  private _background: Selection<SVGRectElement, any, SVGGElement, any>
  private _rectsGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _linesGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _scrollBar: Selection<SVGRectElement, any, SVGGElement, any>
  private _scrollBarWidth = 8
  private _scrollDistance = 0
  private _maxScroll = 0
  private _scrollbarHeight = 0
  private _scrollTimeoutId = null

  constructor (config?: TimelineConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    // Invisible background rect to track events
    this._background = this.g.append('rect').attr('class', s.background)

    // Group for content
    this._rectsGroup = this.g.append('g')
    this._linesGroup = this.g.append('g')

    // Scroll bar
    this._scrollBar = this.g.append('rect')
      .attr('class', s.scrollbar)

    // Set up scrollbar drag event
    const dragBehaviour = drag()
      .on('drag', this._onScrollbarDrag.bind(this))

    this._scrollBar.call(dragBehaviour)
  }

  get bleed (): { top: number; bottom: number; left: number; right: number } {
    const { config: { lineWidth } } = this
    return { top: 0, bottom: 0, left: lineWidth / 2, right: lineWidth / 2 + this._scrollBarWidth * 1.5 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    // Invisible Background rect to track events
    this._background
      .attr('width', config.width)
      .attr('height', config.height)
      .attr('opacity', 0)

    // Line background rects
    const rects = this._rectsGroup.selectAll(`.${s.rect}`)
      .data(data) as Selection<SVGRectElement, Datum, SVGGElement, any>

    const rectsEnter = rects.enter().append('rect')
      .attr('class', s.rect)

    rectsEnter.merge(rects)
      .classed('even', (d, i) => !(i % 2))
      .attr('x', 0)
      .attr('width', config.width - this._scrollBarWidth * 1.5)
      .attr('y', (d, i) => i * config.rowHeight)
      .attr('height', config.rowHeight)

    rects.exit().remove()

    // Lines
    const lines = this._linesGroup.selectAll(`.${s.line}`)
      .data(data, config.id) as Selection<SVGLineElement, Datum, SVGGElement, any>

    const linesEnter = lines.enter().append('line')
      .attr('class', s.line)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .call(this._positionLines, config)
      .attr('transform', 'translate(0, 10)')
      .style('opacity', 0)

    smartTransition(linesEnter.merge(lines), duration)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('stroke-width', config.lineWidth)
      .call(this._positionLines, config)
      .attr('transform', 'translate(0, 0)')
      .style('opacity', 1)

    smartTransition(lines.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Scroll Bar
    const contentBBox = this._rectsGroup.node().getBBox() // We determine content size using the rects group because lines are animated
    const absoluteContentHeight = contentBBox.y + contentBBox.height
    this._scrollbarHeight = config.height * config.height / absoluteContentHeight
    this._scrollBar.attr('height', this._scrollbarHeight)
    this._maxScroll = Math.max(absoluteContentHeight - config.height, 0)

    this._scrollBar
      .attr('width', this._scrollBarWidth)
      .attr('rx', this._scrollBarWidth / 2)
      .attr('ry', this._scrollBarWidth / 2)
      .attr('transform', `translate(${config.width - this._scrollBarWidth}, ${0})`)
      .attr('opacity', this._maxScroll ? 1 : 0)

    this._updateScrollPosition(0)
  }

  _positionLines (selection, config): void {
    const xScale = config.scales.x

    return selection
      .attr('x1', d => xScale(getValue(d, config.x)))
      .attr('x2', d => xScale(getValue(d, config.x) + getValue(d, config.length)))
      .attr('y1', (d, i) => (i + 0.5) * config.rowHeight)
      .attr('y2', (d, i) => (i + 0.5) * config.rowHeight)
      .style('opacity', 1)
  }

  _onScrollbarDrag (): void {
    const { config } = this
    this._updateScrollPosition(event.dy * this._maxScroll / (config.height - this._scrollbarHeight))
  }

  _onMouseWheel (): void {
    event?.preventDefault()
    this._updateScrollPosition(event?.deltaY)

    // Temporarily disable pointer events on lines to prevent scrolling from being interrupted
    this._linesGroup.attr('pointer-events', 'none')
    clearTimeout(this._scrollTimeoutId)
    this._scrollTimeoutId = setTimeout(() => {
      this._linesGroup.attr('pointer-events', null)
    }, 300)
  }

  _updateScrollPosition (diff): void {
    const { config } = this
    this._scrollDistance += diff
    this._scrollDistance = Math.max(0, this._scrollDistance)
    this._scrollDistance = Math.min(this._maxScroll, this._scrollDistance)

    this._linesGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._rectsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (config.height - this._scrollbarHeight)) || 0
    this._scrollBar.attr('y', scrollBarPosition)
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = datamodel.getMin(config.x)
    const max = datamodel.getMax(d => getValue(d, config.x) + getValue(d, config.length))
    return [min, max]
  }
}
