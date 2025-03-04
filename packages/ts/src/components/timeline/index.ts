import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { drag, D3DragEvent } from 'd3-drag'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, arrayOfIndices, getMin, getMax, getString, getNumber, getValue, groupBy, isPlainObject, isFunction } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'
import { textAlignToAnchor, trimSVGText } from 'utils/text'
import { arrowLinePath } from 'utils/path'
import { guid } from 'utils/misc'

// Types
import { TextAlign, Spacing, Arrangement } from 'types'

// Config
import { TimelineDefaultConfig, TimelineConfigInterface } from './config'

// Styles
import * as s from './style'

// Local Types
import type { TimelineArrow, TimelineArrowRenderState, TimelineLineRenderState, TimelineRowLabel } from './types'

// Constants
import { TIMELINE_DEFAULT_ARROW_HEAD_LENGTH, TIMELINE_DEFAULT_ARROW_HEAD_WIDTH } from './constants'

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
  private _arrowsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
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
    this._arrowsGroup = this.g.append('g').attr('class', s.arrows)
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
        const rowLabels = this._getRowLabels(data)
        const longestLabel = rowLabels.reduce((longestLabel, l) => longestLabel.formattedLabel.length > l.formattedLabel.length ? longestLabel : l, rowLabels[0])
        const label = this._labelsGroup.append('text')
          .attr('class', s.label)
          .text(longestLabel?.formattedLabel || '')
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
    const rowLabels = this._getRowLabels(data)
    const numRowLabels = rowLabels.length
    const rowHeight = config.rowHeight || (yHeight / numRowLabels)

    // Ordinal scale to handle records on the same type
    const ordinalScale: ScaleOrdinal<string, number> = scaleOrdinal()
    ordinalScale.range(arrayOfIndices(numRowLabels))
      .domain(rowLabels.map(l => l.label))

    // Invisible Background rect to track events
    this._background
      .attr('width', this._width)
      .attr('height', this._height)
      .attr('opacity', 0)

    // Labels
    const labels = this._labelsGroup.selectAll<SVGTextElement, TimelineRowLabel<Datum>>(`.${s.label}`)
      .data((config.showRowLabels ?? config.showLabels) ? rowLabels : [], l => l?.label)

    const labelOffset = config.rowLabelTextAlign === TextAlign.Center ? this._labelWidth / 2
      : config.rowLabelTextAlign === TextAlign.Left ? this._labelWidth
        : this._labelMargin

    const labelsEnter = labels.enter().append('text')
      .attr('class', s.label)
      .attr('x', xRange[0] - labelOffset)
      .attr('y', l => yStart + (ordinalScale(l.label) + 0.5) * rowHeight)
      .style('opacity', 0)

    const labelsMerged = labelsEnter.merge(labels)
      .text(l => l.formattedLabel)
      .each((label, i, els) => {
        const labelSelection = select(els[i])
        trimSVGText(labelSelection, (config.rowLabelWidth ?? config.labelWidth) || (config.rowMaxLabelWidth ?? config.maxLabelWidth))

        // Apply custom label style if it has been provided
        const customStyle = getValue(label, config.rowLabelStyle)
        if (!isPlainObject(customStyle)) return

        for (const [prop, value] of Object.entries(customStyle)) {
          labelSelection.style(prop, value)
        }
      })
      .style('text-anchor', textAlignToAnchor(config.rowLabelTextAlign as TextAlign))

    smartTransition(labelsMerged, duration)
      .attr('x', xRange[0] - labelOffset)
      .attr('y', l => yStart + (ordinalScale(l.label) + 0.5) * rowHeight)
      .style('opacity', 1)

    smartTransition(labels.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Row background rects
    const xStart = xRange[0]
    const timelineWidth = xRange[1] - xRange[0]
    const numRows = Math.max(Math.floor(yHeight / rowHeight), numRowLabels)
    const recordTypes = Array(numRows).fill(null).map((_, i) => rowLabels[i])
    const rects = this._rowsGroup.selectAll<SVGRectElement, number>(`.${s.row}`)
      .data(recordTypes)

    const rectsEnter = rects.enter().append('rect')
      .attr('class', s.row)
      .attr('x', xStart)
      .attr('width', timelineWidth)
      .attr('y', (_, i) => yStart + i * rowHeight)
      .attr('height', rowHeight)
      .style('opacity', 0)

    const rectsMerged = rectsEnter.merge(rects)
      .classed(s.rowOdd, config.alternatingRowColors ? (_, i) => !(i % 2) : null)

    smartTransition(rectsMerged, duration)
      .attr('x', xStart)
      .attr('width', timelineWidth)
      .attr('y', (_, i) => yStart + i * rowHeight)
      .attr('height', rowHeight)
      .style('opacity', 1)

    smartTransition(rects.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Lines
    const lineDataPrepared = this._prepareLinesData(data, ordinalScale, rowHeight)
    const lines = this._linesGroup.selectAll<SVGGElement, Datum & TimelineLineRenderState>(`.${s.lineGroup}`)
      .data(lineDataPrepared, (d: Datum & TimelineLineRenderState) => d._id)

    const linesEnter = lines.enter().append('g')
      .attr('class', s.lineGroup)
      .style('opacity', 0)
      .attr('transform', (d, i) => {
        const configuredPos = isFunction(config.animationLineEnterPosition)
          ? config.animationLineEnterPosition(d, i, lineDataPrepared)
          : config.animationLineEnterPosition
        const [x, y] = [configuredPos?.[0] ?? d._x, configuredPos?.[1] ?? d._y]
        return `translate(${x}, ${y})`
      })

    linesEnter.append('rect')
      .attr('class', s.line)
      .style('fill', (d, i) => getColor(d, config.color, ordinalScale(this._getRecordKey(d, i))))
      .call(this._renderLines.bind(this), rowHeight)

    linesEnter.append('use').attr('class', s.lineStartIcon)
    linesEnter.append('use').attr('class', s.lineEndIcon)

    const linesMerged = linesEnter.merge(lines)
    smartTransition(linesMerged, duration)
      .attr('transform', d => `translate(${d._x + d._xOffset}, ${d._y})`)
      .style('opacity', 1)

    const lineRectElementsSelection = linesMerged.selectAll<SVGRectElement, Datum & TimelineLineRenderState>(`.${s.line}`)
      .data(d => [d])
    smartTransition(lineRectElementsSelection, duration)
      .style('fill', (d, i) => getColor(d, config.color, ordinalScale(this._getRecordKey(d, i))))
      .style('cursor', (d, i) => getString(d, config.lineCursor ?? config.cursor, i))
      .call(this._renderLines.bind(this), rowHeight)

    linesMerged.selectAll<SVGUseElement, Datum & TimelineLineRenderState>(`.${s.lineStartIcon}`)
      .data(d => [d])
      .attr('href', (d, i) => getString(d, config.lineStartIcon, i))
      .attr('x', (d, i) => {
        const iconSize = d._startIconSize ?? d._height
        const iconArrangement = getValue(d, config.lineStartIconArrangement, i)
        const offset = iconArrangement === Arrangement.Inside ? 0
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : -iconSize
        return offset
      })
      .attr('y', d => (-(d._startIconSize - d._height) / 2) || 0)
      .attr('width', d => d._startIconSize ?? d._height)
      .attr('height', d => d._startIconSize ?? d._height)
      .style('color', d => d._startIconColor)

    linesMerged.selectAll<SVGUseElement, Datum & TimelineLineRenderState>(`.${s.lineEndIcon}`)
      .data(d => [d])
      .attr('href', (d, i) => getString(d, config.lineEndIcon, i))
      .attr('x', (d, i) => {
        const lineHeight = d._height
        const lineLength = d._lengthCorrected
        const iconSize = d._endIconSize ?? lineHeight
        const iconArrangement = getValue(d, config.lineEndIconArrangement, i)
        const offset = iconArrangement === Arrangement.Inside ? -iconSize
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : 0
        return lineLength + offset
      })
      .attr('y', d => -((d._endIconSize - d._height) / 2) || 0)
      .attr('width', d => d._endIconSize ?? d._height)
      .attr('height', d => d._endIconSize ?? d._height)
      .style('color', d => d._endIconColor)

    const linesExit = lines.exit<Datum & TimelineLineRenderState>()
    smartTransition(linesExit, duration)
      .style('opacity', 0)
      .attr('transform', (d, i) => {
        const configuredPos = isFunction(config.animationLineExitPosition)
          ? config.animationLineExitPosition(d, i, lineDataPrepared)
          : config.animationLineExitPosition
        const [x, y] = [configuredPos?.[0] ?? d._x, configuredPos?.[1] ?? d._y]
        return `translate(${x}, ${y})`
      })
      .remove()

    // Arrows
    const arrowsData = this._prepareArrowsData(data, ordinalScale, rowHeight)
    const arrows = this._arrowsGroup.selectAll<SVGPathElement, Datum>(`.${s.arrow}`)
      .data(arrowsData ?? [])

    const arrowsEnter = arrows.enter().append('path')
      .attr('class', s.arrow)
      .style('opacity', 0)

    smartTransition(arrowsEnter.merge(arrows), duration)
      .attr('d', (d) => arrowLinePath({
        x1: d._x1,
        y1: d._y1,
        x2: d._x2,
        y2: d._y2,
        arrowHeadLength: TIMELINE_DEFAULT_ARROW_HEAD_LENGTH,
        arrowHeadWidth: TIMELINE_DEFAULT_ARROW_HEAD_WIDTH,
      }))
      .style('opacity', 1)

    smartTransition(arrows.exit(), duration)
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

    const lineLength = xScale(x + length) - xScale(x)
    return lineLength
  }

  private _getLineHeight (d: Datum, i: number, rowHeight: number): number {
    const { config } = this
    return getNumber(d, config.lineWidth, i) ?? Math.max(Math.floor(rowHeight / 2), 1)
  }

  private _prepareLinesData (data: Datum[], rowOrdinalScale: ScaleOrdinal<string, number>, rowHeight: number): (Datum & TimelineLineRenderState)[] {
    const { config, xScale, yScale } = this
    const yRange = yScale.range()
    const yStart = Math.min(...yRange)
    return data.map((d, i) => {
      const id = getString(d, config.id, i) ?? [
        this._getRecordKey(d, i), getNumber(d, config.x, i),
      ].join('-')

      const lineHeight = this._getLineHeight(d, i, rowHeight)
      const lineLength = this._getLineLength(d, i)

      if (lineLength < 0) {
        console.warn('Unovis | Timeline: Line segments should not have negative lengths. Setting to 0.')
      }

      const isLineTooShort = config.showEmptySegments && config.lineCap && (lineLength < lineHeight)
      const lineLengthCorrected = config.showEmptySegments
        ? Math.max(config.lineCap ? lineHeight : 1, lineLength)
        : Math.max(0, lineLength)

      const x = xScale(getNumber(d, config.x, i))
      const y = yStart + rowOrdinalScale(this._getRecordKey(d, i)) * rowHeight + (rowHeight - lineHeight) / 2
      const xOffset = isLineTooShort ? -(lineLengthCorrected - lineLength) / 2 : 0

      return {
        ...d,
        _x: x,
        _y: y,
        _id: id,
        _xOffset: xOffset,
        _length: lineLength,
        _height: lineHeight,
        _lengthCorrected: lineLengthCorrected,
        _startIconSize: getNumber(d, config.lineStartIconSize, i),
        _endIconSize: getNumber(d, config.lineEndIconSize, i),
        _startIconColor: getString(d, config.lineStartIconColor, i),
        _endIconColor: getString(d, config.lineEndIconColor, i),
      }
    })
  }

  private _prepareArrowsData (data: Datum[], rowOrdinalScale: ScaleOrdinal<string, number>, rowHeight: number): (TimelineArrow & TimelineArrowRenderState)[] {
    const { config } = this

    const arrowsData: (TimelineArrow & TimelineArrowRenderState)[] = config.arrows?.map(l => {
      const startingLineIndex = data.findIndex((d, i) => getString(d, config.id, i) === l.lineSourceId)
      const endingLineIndex = data.findIndex((d, i) => getString(d, config.id, i) === l.lineTargetId)
      const startingLine = data[startingLineIndex]
      const endingLine = data[endingLineIndex]

      if (!startingLine || !endingLine) {
        console.warn('Unovis | Timeline: Arrow references a non-existent line. Skipping...', l)
        return undefined
      }

      const y1 = rowOrdinalScale(this._getRecordKey(startingLine, startingLineIndex)) * rowHeight + rowHeight / 2
      const y2 = rowOrdinalScale(this._getRecordKey(endingLine, endingLineIndex)) * rowHeight + rowHeight / 2
      const startingLineHeight = this._getLineHeight(startingLine, startingLineIndex, rowHeight)
      const endingLineHeight = this._getLineHeight(endingLine, endingLineIndex, rowHeight)

      const arrowY1 = y1 + startingLineHeight / 2 + (l.lineSourceMarginPx ?? 1)
      const arrowY2 = y2 - endingLineHeight / 2 - (l.lineTargetMarginPx ?? 1)

      let arrowX: number
      if (l.x) {
        arrowX = this.xScale(l.x)
      } else {
        arrowX = this.xScale(getNumber(startingLine, config.x, startingLineIndex))
      }

      return {
        ...l,
        _x1: arrowX + (l.xOffsetPx ?? 0),
        _x2: arrowX + (l.xOffsetPx ?? 0),
        _y1: arrowY1 < arrowY2 ? arrowY1 : arrowY2,
        _y2: arrowY1 > arrowY2 ? arrowY1 : arrowY2,
      }
    }).filter(Boolean)

    return arrowsData
  }


  private _renderLines (
    selection: Selection<SVGRectElement, Datum & TimelineLineRenderState, SVGGElement, unknown> | Transition<SVGRectElement, Datum & TimelineLineRenderState, SVGGElement, unknown>
  ): void {
    const { config } = this

    selection
      .attr('width', d => d._lengthCorrected)
      .attr('height', d => d._height)
      .attr('rx', d => config.lineCap ? d._height / 2 : null)
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
    this._arrowsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (yHeight - this._scrollbarHeight)) || 0
    this._scrollBarHandle.attr('y', scrollBarPosition)
  }

  private _getRecordKey (d: Datum, i: number): string {
    return getString(d, this.config.lineRow ?? this.config.type) || `__${i}`
  }

  private _getRowLabels (data: Datum[]): TimelineRowLabel<Datum>[] {
    const grouped = groupBy(data, (d, i) => getString(d, this.config.lineRow ?? this.config.type) || `${i + 1}`)

    const rowLabels: TimelineRowLabel<Datum>[] = Object.entries(grouped).map(([key, items]) => ({
      label: key,
      formattedLabel: this.config.rowLabelFormatter?.(key) ?? key,
      data: items,
    }))

    return rowLabels
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = getMin(datamodel.data, config.x)
    const max = getMax(datamodel.data, (d, i) => getNumber(d, config.x, i) + (getNumber(d, config.lineLength ?? config.length, i) ?? 0))
    return [min, max]
  }
}
