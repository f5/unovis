import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { drag, D3DragEvent } from 'd3-drag'
import { max } from 'd3-array'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, unique, arrayOfIndices, getMin, getMax, getString, getNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'
import { trimSVGText } from 'utils/text'

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
  private _rowsGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _linesGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _labelsGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _scrollBarGroup: Selection<SVGGElement, any, SVGGElement, any>
  private _scrollBarBackground: Selection<SVGRectElement, any, SVGGElement, any>
  private _scrollBarHandle: Selection<SVGRectElement, any, SVGGElement, any>
  private _scrollBarWidth = 5
  private _scrollDistance = 0
  private _scrollBarMargin = 5
  private _maxScroll = 0
  private _scrollbarHeight = 0
  private _scrollTimeoutId = null
  private _labelMargin = 5

  constructor (config?: TimelineConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)

    // Invisible background rect to track events
    this._background = this.g.append('rect').attr('class', s.background)

    // Group for content
    this._rowsGroup = this.g.append('g').attr('class', s.rows)
    this._linesGroup = this.g.append('g').attr('class', s.lines)
    this._labelsGroup = this.g.append('g').attr('class', s.labels)
    this._scrollBarGroup = this.g.append('g').attr('class', s.scrollbar)

    // Scroll bar
    this._scrollBarBackground = this._scrollBarGroup.append('rect')
      .attr('class', s.scrollbarBackground)

    this._scrollBarHandle = this._scrollBarGroup.append('rect')
      .attr('class', s.scrollbarHandle)

    // Set up scrollbar drag event
    const dragBehaviour = drag()
      .on('drag', this._onScrollbarDrag.bind(this))

    this._scrollBarHandle.call(dragBehaviour)
  }

  get bleed (): { top: number; bottom: number; left: number; right: number } {
    const { config, datamodel: { data } } = this

    // We calculate the longest label width to set the bleed values accordingly
    let labelsBleed = 0
    if (config.showLabels) {
      if (config.labelWidth) labelsBleed = config.labelWidth + this._labelMargin
      else {
        const recordLabels = this._getRecordLabels(data)
        const longestLabel = recordLabels.reduce((acc, val) => acc.length > val.length ? acc : val, '')
        const label = this._labelsGroup.append('text')
          .attr('class', s.label)
          .text(longestLabel)
          .call(trimSVGText, config.maxLabelWidth)
        const labelWidth = label.node().getBBox().width
        this._labelsGroup.empty()

        const tolerance = 1.15 // Some characters are wider than others so we add a little of extra space to take that into account
        labelsBleed = labelWidth ? tolerance * labelWidth + this._labelMargin : 0
      }
    }

    const maxLineWidth = this._getMaxLineWidth()
    return {
      top: 0,
      bottom: 0,
      left: maxLineWidth / 2 + labelsBleed,
      right: maxLineWidth / 2 + this._scrollBarWidth + this._scrollBarMargin,
    }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const xRange = this.xScale.range()
    const yRange = this.yScale.range()
    const yStart = Math.min(...yRange)
    const yHeight = Math.abs(yRange[1] - yRange[0])
    const maxLineWidth = this._getMaxLineWidth()
    const recordLabels = this._getRecordLabels(data)
    const recordLabelsUnique = unique(recordLabels)
    const numUniqueRecords = recordLabelsUnique.length

    // Ordinal scale to handle records on the same type
    const ordinalScale: ScaleOrdinal<string, number> = scaleOrdinal()
    ordinalScale.range(arrayOfIndices(numUniqueRecords))

    // Invisible Background rect to track events
    this._background
      .attr('width', this._width)
      .attr('height', this._height)
      .attr('opacity', 0)

    // Labels
    const labels = this._labelsGroup.selectAll(`.${s.label}`)
      .data(config.showLabels ? recordLabelsUnique : []) as Selection<SVGTextElement, string, SVGGElement, any>

    const labelsEnter = labels.enter().append('text')
      .attr('class', s.label)

    labelsEnter.merge(labels)
      .attr('x', xRange[0] - maxLineWidth / 2 - this._labelMargin)
      .attr('y', (_, i) => yStart + (i + 0.5) * config.rowHeight)
      .text(label => label)
      .each((label, i, els) => {
        trimSVGText(select(els[i]), config.labelWidth || config.maxLabelWidth)
      })

    labels.exit().remove()

    // Row background rects
    const xStart = xRange[0]
    const numRows = Math.max(Math.floor(yHeight / config.rowHeight), numUniqueRecords)
    const rects = this._rowsGroup.selectAll(`.${s.rect}`)
      .data(Array(numRows).fill(0)) as Selection<SVGRectElement, number, SVGGElement, any>

    const rectsEnter = rects.enter().append('rect')
      .attr('class', s.rect)

    rectsEnter.merge(rects)
      .classed('odd', config.alternatingRowColors ? (_, i) => !(i % 2) : null)
      .attr('x', xStart - maxLineWidth / 2)
      .attr('width', xRange[1] - xStart + maxLineWidth)
      .attr('y', (_, i) => yStart + i * config.rowHeight)
      .attr('height', config.rowHeight)

    rects.exit().remove()

    // Lines
    const lines = this._linesGroup.selectAll(`.${s.line}`)
      .data(data, (d, i) => `${getString(d, config.id) ?? i}`) as Selection<SVGLineElement, Datum, SVGGElement, any>

    const linesEnter = lines.enter().append('line')
      .attr('class', s.line)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('transform', 'translate(0, 10)')
      .style('opacity', 0)
    this._positionLines(linesEnter, ordinalScale)

    const linesMerged = smartTransition(linesEnter.merge(lines), duration)
      .style('stroke', (d, i) => getColor(d, config.color, i))
      .attr('stroke-width', (d, i) => getNumber(d, config.lineWidth, i))
      .attr('transform', 'translate(0, 0)')
      .style('cursor', (d, i) => getString(d, config.cursor, i))
      .style('stroke-linecap', (d, i) => getString(d, config.lineCap, i))
      .style('opacity', 1)
    this._positionLines(linesMerged, ordinalScale)

    smartTransition(lines.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Scroll Bar
    const contentBBox = this._rowsGroup.node().getBBox() // We determine content size using the rects group because lines are animated
    const absoluteContentHeight = contentBBox.height
    this._scrollbarHeight = yHeight * yHeight / absoluteContentHeight
    this._maxScroll = Math.max(absoluteContentHeight - yHeight, 0)

    this._scrollBarGroup
      .attr('transform', `translate(${this._width - this._scrollBarWidth}, ${yStart})`)
      .attr('opacity', this._maxScroll ? 1 : 0)

    this._scrollBarBackground
      .attr('width', this._scrollBarWidth)
      .attr('height', this._height)
      .attr('rx', this._scrollBarWidth / 2)
      .attr('ry', this._scrollBarWidth / 2)

    this._scrollBarHandle
      .attr('width', this._scrollBarWidth)
      .attr('height', this._scrollbarHeight)
      .attr('rx', this._scrollBarWidth / 2)
      .attr('ry', this._scrollBarWidth / 2)

    this._updateScrollPosition(0)
    this._setPointerEvents()
  }

  private _positionLines (
    selection: Selection<SVGLineElement, Datum, SVGGElement, unknown> | Transition<SVGLineElement, Datum, SVGGElement, unknown>,
    ordinalScale: ScaleOrdinal<string, number>
  ): typeof selection {
    const { config, xScale, yScale } = this
    const yRange = yScale.range()
    const yStart = Math.min(...yRange)

    return selection
      .attr('x1', (d, i) => xScale(getNumber(d, config.x, i)))
      .attr('x2', (d, i) => xScale(getNumber(d, config.x, i) + getNumber(d, config.length, i)))
      .attr('y1', (d, i) => yStart + (ordinalScale(this._getRecordType(d, i)) + 0.5) * config.rowHeight)
      .attr('y2', (d, i) => yStart + (ordinalScale(this._getRecordType(d, i)) + 0.5) * config.rowHeight)
      .style('opacity', 1)
  }

  private _onScrollbarDrag (event: D3DragEvent<any, any, any>): void {
    const yRange = this.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])
    this._updateScrollPosition(event.dy * this._maxScroll / (yHeight - this._scrollbarHeight))
  }

  private _onMouseWheel (d: unknown, event: WheelEvent): void {
    const { config } = this

    this._updateScrollPosition(event?.deltaY)
    if (this._scrollDistance > 0 && this._scrollDistance < this._maxScroll) event?.preventDefault()

    config.onScroll?.(this._scrollDistance)
    // Temporarily disable pointer events on lines to prevent scrolling from being interrupted
    this._linesGroup.attr('pointer-events', 'none')
    clearTimeout(this._scrollTimeoutId)
    this._scrollTimeoutId = setTimeout(() => {
      this._setPointerEvents()
    }, 300)
  }

  private _setPointerEvents (): void {
    const { config } = this

    const hasLineEvents = Object.keys(config.events).includes(s.line)
    const hasLinesGroupEvents = Object.keys(config.events).includes(s.lines)
    this._linesGroup.attr('pointer-events', (hasLineEvents || hasLinesGroupEvents) ? null : 'none')
  }

  private _updateScrollPosition (diff: number): void {
    const yRange = this.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])

    this._scrollDistance += diff
    this._scrollDistance = Math.max(0, this._scrollDistance)
    this._scrollDistance = Math.min(this._maxScroll, this._scrollDistance)

    this._linesGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._rowsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._labelsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (yHeight - this._scrollbarHeight)) || 0
    this._scrollBarHandle.attr('y', scrollBarPosition)
  }

  private _getMaxLineWidth (): number {
    const { config, datamodel: { data } } = this
    return max(data, (d, i) => getNumber(d, config.lineWidth, i)) ?? 0
  }

  private _getRecordType (d: Datum, i: number): string {
    return getString(d, this.config.type) || `__${i}`
  }

  private _getRecordLabels (data: Datum[]): string[] {
    return data.map((d, i) => getString(d, this.config.type) || `${i + 1}`)
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = getMin(datamodel.data, config.x)
    const max = getMax(datamodel.data, (d, i) => getNumber(d, config.x, i) + getNumber(d, config.length, i))
    return [min, max]
  }
}
