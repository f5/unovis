// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { drag, D3DragEvent } from 'd3-drag'
import { max } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, countUnique, arrayOfIndices, getMin, getMax, getString, getNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'

// Types
import { GenericDataRecord } from 'types/data'

// Config
import { TimelineConfig, TimelineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Timeline<Datum = GenericDataRecord> extends XYComponentCore<Datum> {
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
    const maxLineWidth = this._getMaxLineWidth()
    return { top: 0, bottom: 0, left: maxLineWidth / 2, right: maxLineWidth / 2 + this._scrollBarWidth * 1.5 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const xRange = config.xScale.range()
    const yRange = config.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])
    const maxLineWidth = this._getMaxLineWidth()

    // Ordinal scale to handle records on the same type
    const ordinal: ScaleOrdinal<string, number> = scaleOrdinal()
    const recordTypes = data.map((d, i) => getString(d, config.type) || i)
    const numUniqueRecords = countUnique(recordTypes)
    ordinal.range(arrayOfIndices(numUniqueRecords))

    // Invisible Background rect to track events
    this._background
      .attr('width', config.width)
      .attr('height', config.height)
      .attr('opacity', 0)

    // Line background rects
    const numRows = Math.max(Math.floor(yHeight / config.rowHeight), numUniqueRecords)
    const rects = this._rectsGroup.selectAll(`.${s.rect}`)
      .data(Array(numRows).fill(0)) as Selection<SVGRectElement, Datum, SVGGElement, any>

    const rectsEnter = rects.enter().append('rect')
      .attr('class', s.rect)

    rectsEnter.merge(rects)
      .classed('even', (d, i) => !(i % 2))
      .attr('x', xRange[0] - maxLineWidth / 2)
      .attr('width', xRange[1] - xRange[0] + maxLineWidth)
      .attr('y', (d, i) => yRange[1] + i * config.rowHeight)
      .attr('height', config.rowHeight)

    rects.exit().remove()

    // Lines
    const lines = this._linesGroup.selectAll(`.${s.line}`)
      .data(data, (d, i) => `${getString(d, config.id) ?? i}`) as Selection<SVGLineElement, Datum, SVGGElement, any>

    const linesEnter = lines.enter().append('line')
      .attr('class', s.line)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .call(this._positionLines, config, ordinal)
      .attr('transform', 'translate(0, 10)')
      .style('opacity', 0)

    smartTransition(linesEnter.merge(lines), duration)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('stroke-width', d => getNumber(d, config.lineWidth))
      .call(this._positionLines, config, ordinal)
      .attr('transform', 'translate(0, 0)')
      .style('cursor', d => getString(d, config.cursor))
      .style('opacity', 1)

    smartTransition(lines.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Scroll Bar
    const contentBBox = this._rectsGroup.node().getBBox() // We determine content size using the rects group because lines are animated
    const absoluteContentHeight = contentBBox.height
    this._scrollbarHeight = yHeight * yHeight / absoluteContentHeight
    this._scrollBar.attr('height', this._scrollbarHeight)
    this._maxScroll = Math.max(absoluteContentHeight - yHeight, 0)

    this._scrollBar
      .attr('width', this._scrollBarWidth)
      .attr('rx', this._scrollBarWidth / 2)
      .attr('ry', this._scrollBarWidth / 2)
      .attr('transform', `translate(${config.width - this._scrollBarWidth}, ${yRange[1]})`)
      .attr('opacity', this._maxScroll ? 1 : 0)

    this._updateScrollPosition(0)
  }

  _positionLines (selection, config, ordinal): void {
    const xScale = config.xScale
    const yRange = config.yScale.range()

    return selection
      .attr('x1', d => xScale(getNumber(d, config.x)))
      .attr('x2', d => xScale(getNumber(d, config.x) + getNumber(d, config.length)))
      .attr('y1', (d, i) => yRange[1] + (ordinal(d.type || i) + 0.5) * config.rowHeight)
      .attr('y2', (d, i) => yRange[1] + (ordinal(d.type || i) + 0.5) * config.rowHeight)
      .style('opacity', 1)
  }

  _onScrollbarDrag (event: D3DragEvent<any, any, any>): void {
    const { config } = this
    const yRange = config.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])
    this._updateScrollPosition(event.dy * this._maxScroll / (yHeight - this._scrollbarHeight))
  }

  _onMouseWheel (d: unknown, event: WheelEvent): void {
    this._updateScrollPosition(event?.deltaY)
    if (this._scrollDistance > 0 && this._scrollDistance < this._maxScroll) event?.preventDefault()

    // Temporarily disable pointer events on lines to prevent scrolling from being interrupted
    this._linesGroup.attr('pointer-events', 'none')
    clearTimeout(this._scrollTimeoutId)
    this._scrollTimeoutId = setTimeout(() => {
      this._linesGroup.attr('pointer-events', null)
    }, 300)
  }

  _updateScrollPosition (diff): void {
    const { config } = this
    const yRange = config.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])

    this._scrollDistance += diff
    this._scrollDistance = Math.max(0, this._scrollDistance)
    this._scrollDistance = Math.min(this._maxScroll, this._scrollDistance)

    this._linesGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._rectsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (yHeight - this._scrollbarHeight)) || 0
    this._scrollBar.attr('y', scrollBarPosition)
  }

  _getMaxLineWidth (): number {
    const { config, datamodel: { data } } = this

    return max(data, d => getNumber(d, config.lineWidth)) ?? 0
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = getMin(datamodel.data, config.x)
    const max = getMax(datamodel.data, d => getNumber(d, config.x) + getNumber(d, config.length))
    return [min, max]
  }
}
