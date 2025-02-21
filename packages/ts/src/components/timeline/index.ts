import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { drag, D3DragEvent } from 'd3-drag'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, unique, arrayOfIndices, getMin, getMax, getString, getNumber, getValue } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'
import { textAlignToAnchor, trimSVGText } from 'utils/text'
import { guid } from 'utils'

// Types
import { TextAlign, Spacing, Arrangement } from 'types'

// Config
import { TimelineDefaultConfig, TimelineConfigInterface } from './config'

// Styles
import * as s from './style'

export class Timeline<Datum> extends XYComponentCore<Datum, TimelineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = TimelineDefaultConfig as TimelineConfigInterface<Datum>
  public config: TimelineConfigInterface<Datum> = this._defaultConfig

  events = {
    [Timeline.selectors.rows]: {
      wheel: this._onMouseWheel.bind(this),
    },
    [Timeline.selectors.line]: {
      wheel: this._onMouseWheel.bind(this),
    },
  }

  private _background: Selection<SVGRectElement, unknown, SVGGElement, unknown>
  private _rowsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _linesGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _labelsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _scrollBarGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  private _scrollBarBackground: Selection<SVGRectElement, unknown, SVGGElement, unknown>
  private _scrollBarHandle: Selection<SVGRectElement, unknown, SVGGElement, unknown>
  private _scrollBarWidth = 5
  private _scrollDistance = 0
  private _scrollBarMargin = 5
  private _maxScroll = 0
  private _scrollbarHeight = 0
  private _labelMargin = 5
  private _labelWidth = 0 // Will be overridden in `get bleed ()`

  /** We define a dedicated clipping path for this component because it needs to behave
   * differently than the regular XYContainer's clipPath */
  private _clipPathId = guid()
  private _clipPath: Selection<SVGClipPathElement, unknown, null, undefined>

  constructor (config?: TimelineConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)

    // Invisible background rect to track events
    this._background = this.g.append('rect').attr('class', s.background)

    // Clip path
    this._clipPath = this.g.append('clipPath')
      .attr('id', this._clipPathId)
    this._clipPath.append('rect')

    // Group for content
    this._rowsGroup = this.g.append('g').attr('class', s.rows)
      .style('clip-path', `url(#${this._clipPathId})`)
    this._linesGroup = this.g.append('g').attr('class', s.lines)
      .style('clip-path', `url(#${this._clipPathId})`)
    this._labelsGroup = this.g.append('g').attr('class', s.labels)
    this._scrollBarGroup = this.g.append('g').attr('class', s.scrollbar)

    // Scroll bar
    this._scrollBarBackground = this._scrollBarGroup.append('rect')
      .attr('class', s.scrollbarBackground)

    this._scrollBarHandle = this._scrollBarGroup.append('rect')
      .attr('class', s.scrollbarHandle)

    // Set up scrollbar drag event
    const dragBehaviour = drag<SVGRectElement, unknown>()
      .on('drag', this._onScrollbarDrag.bind(this))

    this._scrollBarHandle.call(dragBehaviour)
  }

  get bleed (): Spacing {
    const { config, datamodel: { data } } = this

    // We calculate the longest label width to set the bleed values accordingly
    if (config.showRowLabels ?? config.showLabels) {
      if (config.rowLabelWidth ?? config.labelWidth) this._labelWidth = (config.rowLabelWidth ?? config.labelWidth) + this._labelMargin
      else {
        const recordLabels = this._getRecordLabels(data)
        const longestLabel = recordLabels.reduce((acc, val) => acc.length > val.length ? acc : val, '')
        const label = this._labelsGroup.append('text')
          .attr('class', s.label)
          .text(longestLabel)
          .call(trimSVGText, config.rowMaxLabelWidth ?? config.maxLabelWidth)
        const labelWidth = label.node().getBBox().width
        this._labelsGroup.empty()

        const tolerance = 1.15 // Some characters are wider than others so we add a little of extra space to take that into account
        this._labelWidth = labelWidth ? tolerance * labelWidth + this._labelMargin : 0
      }
    }

    return {
      top: 0,
      bottom: 0,
      left: this._labelWidth,
      right: this._scrollBarWidth + this._scrollBarMargin,
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
    const recordLabels = this._getRecordLabels(data)
    const recordLabelsUnique = unique(recordLabels)
    const numUniqueRecords = recordLabelsUnique.length
    const rowHeight = config.rowHeight || (yHeight / numUniqueRecords)

    // Ordinal scale to handle records on the same type
    const ordinalScale: ScaleOrdinal<string, number> = scaleOrdinal()
    ordinalScale.range(arrayOfIndices(numUniqueRecords))

    // Invisible Background rect to track events
    this._background
      .attr('width', this._width)
      .attr('height', this._height)
      .attr('opacity', 0)

    // Labels
    const labels = this._labelsGroup.selectAll<SVGTextElement, string>(`.${s.label}`)
      .data((config.showRowLabels ?? config.showLabels) ? recordLabelsUnique : [])

    const labelsEnter = labels.enter().append('text')
      .attr('class', s.label)

    const labelOffset = config.rowLabelTextAlign === TextAlign.Center ? this._labelWidth / 2
      : config.rowLabelTextAlign === TextAlign.Left ? this._labelWidth
        : this._labelMargin

    labelsEnter.merge(labels)
      .attr('x', xRange[0] - labelOffset)
      .attr('y', (label, i) => yStart + (ordinalScale(label) + 0.5) * rowHeight)
      .text(label => label)
      .style('text-anchor', textAlignToAnchor(config.rowLabelTextAlign as TextAlign))
      .each((label, i, els) => {
        trimSVGText(select(els[i]), (config.rowLabelWidth ?? config.labelWidth) || (config.rowMaxLabelWidth ?? config.maxLabelWidth))
      })

    labels.exit().remove()

    // Row background rects
    const xStart = xRange[0]
    const timelineWidth = xRange[1] - xRange[0]
    const numRows = Math.max(Math.floor(yHeight / rowHeight), numUniqueRecords)
    const recordTypes: (string | undefined)[] = Array(numRows).fill(null).map((_, i) => recordLabelsUnique[i])
    const rects = this._rowsGroup.selectAll<SVGRectElement, number>(`.${s.row}`)
      .data(recordTypes)

    const rectsEnter = rects.enter().append('rect')
      .attr('class', s.row)

    rectsEnter.merge(rects)
      .classed(s.rowOdd, config.alternatingRowColors ? (_, i) => !(i % 2) : null)
      .attr('x', xStart)
      .attr('width', timelineWidth)
      .attr('y', (_, i) => yStart + i * rowHeight)
      .attr('height', rowHeight)

    rects.exit().remove()

    // Lines
    const lines = this._linesGroup.selectAll<SVGGElement, Datum>(`.${s.lineGroup}`)
      .data(
        data, (d: Datum, i) => getString(d, config.id, i) ?? [
          this._getRecordKey(d, i), getNumber(d, config.x, i),
        ].join('-')
      )

    const linesEnter = lines.enter().append('g')
      .attr('class', s.lineGroup)
      .style('opacity', 0)
      .call(this._positionLineGroups.bind(this), ordinalScale, rowHeight)

    linesEnter.append('rect')
      .attr('class', s.line)
      .classed(s.rowOdd, config.alternatingRowColors
        ? (d, i) => !(recordLabelsUnique.indexOf(this._getRecordKey(d, i)) % 2)
        : null)
      .style('fill', (d, i) => getColor(d, config.color, ordinalScale(this._getRecordKey(d, i))))
      .call(this._positionLines.bind(this), rowHeight)

    // Line Icons
    linesEnter.append('use').attr('class', s.lineStartIcon)
    linesEnter.append('use').attr('class', s.lineEndIcon)

    const linesMerged = linesEnter.merge(lines)
      .call(this._positionLineGroups.bind(this), ordinalScale, rowHeight)

    linesMerged.selectAll<SVGRectElement, Datum>(`.${s.line}`)
      .data(d => [d])
      .style('fill', (d, i) => getColor(d, config.color, ordinalScale(this._getRecordKey(d, i))))
      .style('cursor', (d, i) => getString(d, config.lineCursor ?? config.cursor, i))
      .call(this._positionLines.bind(this), rowHeight)

    linesMerged.selectAll<SVGUseElement, Datum>(`.${s.lineStartIcon}`)
      .attr('href', (d, i) => getString(d, config.lineStartIcon, i))
      .attr('x', (d, i) => {
        const iconSize = getNumber(d, config.lineStartIconSize, i) ?? this._getLineHeight(d, i, rowHeight)
        const iconArrangement = getValue(d, config.lineStartIconArrangement, i)
        const offset = iconArrangement === Arrangement.Inside ? 0
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : -iconSize
        return offset
      })
      .attr('y', (d, i) => -(getNumber(d, config.lineStartIconSize, i) - this._getLineHeight(d, i, rowHeight)) / 2)
      .attr('width', (d, i) => getNumber(d, config.lineStartIconSize, i) ?? this._getLineHeight(d, i, rowHeight))
      .attr('height', (d, i) => getNumber(d, config.lineStartIconSize, i) ?? this._getLineHeight(d, i, rowHeight))
      .style('color', (d, i) => getString(d, config.lineStartIconColor, i))

    linesMerged.selectAll<SVGUseElement, Datum>(`.${s.lineEndIcon}`)
      .attr('href', (d, i) => getString(d, config.lineEndIcon, i))
      .attr('x', (d, i) => {
        const lineLength = this._getLineLength(d, i)
        const iconSize = getNumber(d, config.lineEndIconSize, i) ?? this._getLineHeight(d, i, rowHeight)
        const iconArrangement = getValue(d, config.lineEndIconArrangement, i)
        const offset = iconArrangement === Arrangement.Inside ? -iconSize
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : 0
        return lineLength + offset
      })
      .attr('y', (d, i) => -(getNumber(d, config.lineEndIconSize, i) - this._getLineHeight(d, i, rowHeight)) / 2)
      .attr('width', (d, i) => getNumber(d, config.lineEndIconSize, i) ?? this._getLineHeight(d, i, rowHeight))
      .attr('height', (d, i) => getNumber(d, config.lineEndIconSize, i) ?? this._getLineHeight(d, i, rowHeight))
      .style('color', (d, i) => getString(d, config.lineEndIconColor, i))


    // Fade in / out
    smartTransition(linesMerged, duration)
      .style('opacity', 1)

    smartTransition(lines.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Scroll Bar
    const contentBBox = this._rowsGroup.node().getBBox() // We determine content size using the rects group because lines are animated
    const absoluteContentHeight = contentBBox.height
    this._scrollbarHeight = yHeight * yHeight / absoluteContentHeight || 0
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

    // Clip path
    this._clipPath.select('rect')
      .attr('x', xRange[0])
      .attr('width', timelineWidth)
      .attr('height', this._height)
  }

  private _getLineLength (d: Datum, i: number): number {
    const { config, xScale } = this
    const x = getNumber(d, config.x, i)
    const length = getNumber(d, config.lineLength ?? config.length, i) ?? 0

    return xScale(x + length) - xScale(x)
  }

  private _getLineHeight (d: Datum, i: number, rowHeight: number): number {
    const { config } = this
    return getNumber(d, config.lineWidth, i) ?? Math.max(Math.floor(rowHeight / 2), 1)
  }

  private _positionLineGroups (
    selection: Selection<SVGGElement, Datum, SVGGElement, unknown> | Transition<SVGRectElement, Datum, SVGGElement, unknown>,
    ordinalScale: ScaleOrdinal<string, number>,
    rowHeight: number
  ): void {
    const { config, xScale, yScale } = this
    const yRange = yScale.range()
    const yStart = Math.min(...yRange)

    selection.each((d, i, elements) => {
      const x = getNumber(d, config.x, i)
      const y = ordinalScale(this._getRecordKey(d, i)) * rowHeight
      const lineHeight = this._getLineHeight(d, i, rowHeight)

      select(elements[i])
        .attr('transform', `translate(${xScale(x)}, ${yStart + y + (rowHeight - lineHeight) / 2})`)
    })
  }

  private _positionLines (
    selection: Selection<SVGRectElement, Datum, SVGGElement, unknown> | Transition<SVGRectElement, Datum, SVGGElement, unknown>,
    rowHeight: number
  ): void {
    const { config } = this

    selection.each((d, i, elements) => {
      // Rect dimensions
      const height = this._getLineHeight(d, i, rowHeight)
      const width = this._getLineLength(d, i)

      if (width < 0) {
        console.warn('Unovis | Timeline: Line segments should not have negative lengths. Setting to 0.')
      }

      select(elements[i])
        .attr('width', config.showEmptySegments
          ? Math.max(config.lineCap ? height : 1, width)
          : Math.max(0, width))
        .attr('height', height)
        .attr('rx', config.lineCap ? height / 2 : null)
    })
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

    // Programmatically trigger a mousemove event to update Tooltip or Crosshair if they were set up
    const e = new Event('mousemove')
    this.element.dispatchEvent(e)
  }

  private _updateScrollPosition (diff: number): void {
    const yRange = this.yScale.range()
    const yHeight = Math.abs(yRange[1] - yRange[0])

    this._scrollDistance += diff
    this._scrollDistance = Math.max(0, this._scrollDistance)
    this._scrollDistance = Math.min(this._maxScroll, this._scrollDistance)

    this._clipPath.attr('transform', `translate(0,${this._scrollDistance})`)
    this._linesGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._rowsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._labelsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (yHeight - this._scrollbarHeight)) || 0
    this._scrollBarHandle.attr('y', scrollBarPosition)
  }

  private _getRecordKey (d: Datum, i: number): string {
    return getString(d, this.config.lineRow ?? this.config.type) || `__${i}`
  }

  private _getRecordLabels (data: Datum[]): string[] {
    return data.map((d, i) => getString(d, this.config.lineRow ?? this.config.type) || `${i + 1}`)
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = getMin(datamodel.data, config.x)
    const max = getMax(datamodel.data, (d, i) => getNumber(d, config.x, i) + (getNumber(d, config.lineLength ?? config.length, i) ?? 0))
    return [min, max]
  }
}
