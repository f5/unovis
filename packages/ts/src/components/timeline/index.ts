import { select, Selection } from 'd3-selection'
import { Transition } from 'd3-transition'
import { max, min, minIndex } from 'd3-array'
import { scaleOrdinal, ScaleOrdinal } from 'd3-scale'
import { drag, D3DragEvent } from 'd3-drag'

// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { isNumber, arrayOfIndices, getMin, getMax, getString, getNumber, getValue, groupBy, isPlainObject, isFunction } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { getColor } from 'utils/color'
import { textAlignToAnchor, trimSVGText } from 'utils/text'
import { arrowPolylinePath } from 'utils/path'
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
import { TIMELINE_DEFAULT_ARROW_HEAD_LENGTH, TIMELINE_DEFAULT_ARROW_HEAD_WIDTH, TIMELINE_DEFAULT_ARROW_MARGIN } from './constants'

// Utils
import { getIconBleed } from './utils'

export class Timeline<Datum> extends XYComponentCore<Datum, TimelineConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = TimelineDefaultConfig as TimelineConfigInterface<Datum>
  public config: TimelineConfigInterface<Datum> = this._defaultConfig

  events = {
    [Timeline.selectors.background]: {
      wheel: this._onMouseWheel.bind(this),
    },
    [Timeline.selectors.label]: {
      wheel: this._onMouseWheel.bind(this),
    },
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
  private _rowIconsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
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
  private _rowIconBleed: [number, number] = [0, 0]
  private _lineBleed: [number, number] = [0, 0]

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
    this._rowIconsGroup = this.g.append('g').attr('class', s.rowIcons)
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

  public setConfig (config: TimelineConfigInterface<Datum>): void {
    super.setConfig(config)
  }

  public setData (data: Datum[]): void {
    super.setData(data)
  }

  get bleed (): Spacing {
    const { config, datamodel: { data } } = this
    const rowLabels = this._getRowLabels(data)
    const rowHeight = config.rowHeight || (this._height / (rowLabels.length || 1))
    const hasIcons = rowLabels.some(l => l.iconHref)
    const maxIconSize = max(rowLabels.map(l => l.iconSize || 0))

    // We calculate the longest label width to set the bleed values accordingly
    if (config.showRowLabels ?? config.showLabels) {
      if (config.rowLabelWidth ?? config.labelWidth) this._labelWidth = (config.rowLabelWidth ?? config.labelWidth) + this._labelMargin
      else {
        const longestLabel = rowLabels.reduce((longestLabel, l) => longestLabel.formattedLabel.length > l.formattedLabel.length ? longestLabel : l, rowLabels[0])
        const label = this._labelsGroup.append('text')
          .attr('class', s.label)
          .text(longestLabel?.formattedLabel || '')
          .call(trimSVGText, config.rowMaxLabelWidth ?? config.maxLabelWidth)

        const labelWidth = label.node().getBBox().width
        label.remove()

        const tolerance = 1.15 // Some characters are wider than others so we add a little of extra space to take that into account
        this._labelWidth = labelWidth ? tolerance * labelWidth + this._labelMargin : 0
      }
    }

    // There can be multiple start / end items with the same timestamp, so we need to find the shortest one
    const minTimestamp = min(data, (d, i) => getNumber(d, config.x, i))
    const dataMin = data.filter((d, i) => getNumber(d, config.x, i) === minTimestamp)
    const dataMinShortestItemIdx = minIndex(dataMin, (d, i) => this._getLineDuration(d, i))
    const firstItemIdx = data.findIndex(d => d === dataMin[dataMinShortestItemIdx])
    const firstItem = data[firstItemIdx]

    const maxTimestamp = max(data, (d, i) => getNumber(d, config.x, i) + this._getLineDuration(d, i))
    const dataMax = data.filter((d, i) => getNumber(d, config.x, i) + this._getLineDuration(d, i) === maxTimestamp)
    const dataMaxShortestItemIdx = minIndex(dataMax, (d, i) => this._getLineDuration(d, i))
    const lastItemIdx = data.findIndex(d => d === dataMax[dataMaxShortestItemIdx])
    const lastItem = data[lastItemIdx]

    // Small segments bleed
    const lineBleed = [1, 1] as [number, number]
    if (config.showEmptySegments && config.lineCap && firstItem && lastItem) {
      const firstItemStart = getNumber(firstItem, config.x, firstItemIdx)
      const firstItemEnd = getNumber(firstItem, config.x, firstItemIdx) + this._getLineDuration(firstItem, firstItemIdx)
      const lastItemStart = getNumber(lastItem, config.x, lastItemIdx)
      const lastItemEnd = getNumber(lastItem, config.x, lastItemIdx) + this._getLineDuration(lastItem, lastItemIdx)
      const fullTimeRange = lastItemEnd - firstItemStart
      const firstItemHeight = this._getLineWidth(firstItem, firstItemIdx, rowHeight)
      const lastItemHeight = this._getLineWidth(lastItem, lastItemIdx, rowHeight)

      if ((firstItemEnd - firstItemStart) / fullTimeRange * this._width < firstItemHeight) lineBleed[0] = firstItemHeight / 2
      if ((lastItemEnd - lastItemStart) / fullTimeRange * this._width < lastItemHeight) lineBleed[1] = lastItemHeight / 2
    }
    this._lineBleed = lineBleed

    // Icon bleed
    const iconBleed = [0, 0] as [number, number]
    if (config.lineStartIcon) {
      iconBleed[0] = max(data, (d, i) => getIconBleed(d, i, config.lineStartIcon, config.lineStartIconSize, config.lineStartIconArrangement, rowHeight)) || 0
    }

    if (config.lineEndIcon) {
      iconBleed[1] = max(data, (d, i) => getIconBleed(d, i, config.lineEndIcon, config.lineEndIconSize, config.lineEndIconArrangement, rowHeight)) || 0
    }

    this._rowIconBleed = iconBleed

    return {
      top: 0,
      bottom: 0,
      left: this._labelWidth + iconBleed[0] + (hasIcons ? maxIconSize : 0) + lineBleed[0],
      right: this._scrollBarWidth + this._scrollBarMargin + iconBleed[1] + lineBleed[1],
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
    const rowHeight = config.rowHeight || (yHeight / (numRowLabels || 1))

    const yOrdinalScale = scaleOrdinal<string, number>()
      .range(arrayOfIndices(numRowLabels))
      .domain(rowLabels.map(l => l.label))

    const lineDataPrepared = this._prepareLinesData(data, yOrdinalScale, rowHeight)

    // Invisible Background rect to track events
    this._background
      .attr('width', this._width)
      .attr('height', this._height)
      .attr('opacity', 0)

    // Row Icons
    const rowIcons = this._rowIconsGroup.selectAll<SVGUseElement, TimelineRowLabel<Datum>>(`.${s.rowIcon}`)
      .data(rowLabels.filter(d => d.iconSize), l => l?.label)

    const rowIconsEnter = rowIcons.enter().append('use')
      .attr('class', s.rowIcon)
      .attr('x', 0)
      .attr('width', l => l.iconSize)
      .attr('height', l => l.iconSize)
      .attr('y', l => yStart + (yOrdinalScale(l.label) + 0.5) * rowHeight - l.iconSize / 2)
      .style('opacity', 0)

    smartTransition(rowIconsEnter.merge(rowIcons), duration)
      .attr('href', l => l.iconHref)
      .attr('x', 0)
      .attr('y', l => yStart + (yOrdinalScale(l.label) + 0.5) * rowHeight - l.iconSize / 2)
      .attr('width', l => l.iconSize)
      .attr('height', l => l.iconSize)
      .style('color', l => l.iconColor)
      .style('opacity', 1)

    smartTransition(rowIcons.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Labels
    const labels = this._labelsGroup.selectAll<SVGTextElement, TimelineRowLabel<Datum>>(`.${s.label}`)
      .data((config.showRowLabels ?? config.showLabels) ? rowLabels : [], l => l?.label)

    const labelOffset = config.rowLabelTextAlign === TextAlign.Center ? this._labelWidth / 2
      : config.rowLabelTextAlign === TextAlign.Left ? this._labelWidth
        : this._labelMargin

    const xStart = xRange[0] - this._rowIconBleed[0] - this._lineBleed[0]
    const labelXStart = xStart - labelOffset
    const labelsEnter = labels.enter().append('text')
      .attr('class', s.label)
      .attr('x', labelXStart)
      .attr('y', l => yStart + (yOrdinalScale(l.label) + 0.5) * rowHeight)
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
      .attr('x', labelXStart)
      .attr('y', l => yStart + (yOrdinalScale(l.label) + 0.5) * rowHeight)
      .style('opacity', 1)

    smartTransition(labels.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Row background rects
    const timelineWidth = xRange[1] - xRange[0] + this._rowIconBleed[0] + this._rowIconBleed[1] + this._lineBleed[0] + this._lineBleed[1]
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
    const lines = this._linesGroup.selectAll<SVGGElement, Datum & TimelineLineRenderState>(`.${s.lineGroup}`)
      .data(lineDataPrepared, (d: Datum & TimelineLineRenderState) => d._id)

    const linesEnter = lines.enter().append('g')
      .attr('class', s.lineGroup)
      .style('opacity', 0)
      .attr('transform', (d, i) => {
        const configuredPos = isFunction(config.animationLineEnterPosition)
          ? config.animationLineEnterPosition(d, i, lineDataPrepared)
          : config.animationLineEnterPosition
        const [x, y] = [configuredPos?.[0] ?? d._xPx, configuredPos?.[1] ?? d._yPx]
        return `translate(${x}, ${y})`
      })

    linesEnter.append('rect')
      .attr('class', s.line)
      .style('fill', (d, i) => getColor(d, config.color, yOrdinalScale(this._getRecordKey(d, i))))
      .call(this._renderLines.bind(this), rowHeight)

    linesEnter.append('use').attr('class', s.lineStartIcon)
    linesEnter.append('use').attr('class', s.lineEndIcon)

    const linesMerged = linesEnter.merge(lines)
    smartTransition(linesMerged, duration)
      .attr('transform', d => `translate(${d._xPx + d._xOffsetPx}, ${d._yPx})`)
      .style('opacity', 1)

    const lineRectElementsSelection = linesMerged.selectAll<SVGRectElement, Datum & TimelineLineRenderState>(`.${s.line}`)
      .data(d => [d])
    smartTransition(lineRectElementsSelection, duration)
      .style('fill', (d, i) => getColor(d, config.color, yOrdinalScale(this._getRecordKey(d, i))))
      .style('cursor', (d, i) => getString(d, config.lineCursor ?? config.cursor, i))
      .call(this._renderLines.bind(this), rowHeight)

    linesMerged.selectAll<SVGUseElement, Datum & TimelineLineRenderState>(`.${s.lineStartIcon}`)
      .data(d => [d])
      .attr('href', (d, i) => getString(d, config.lineStartIcon, i))
      .attr('x', (d, i) => {
        const iconSize = d._startIconSize
        const iconArrangement = d._startIconArrangement
        const offset = iconArrangement === Arrangement.Inside ? 0
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : -iconSize
        return offset
      })
      .attr('y', d => (-(d._startIconSize - d._height) / 2) || 0)
      .attr('width', d => d._startIconSize)
      .attr('height', d => d._startIconSize)
      .style('color', d => d._startIconColor)

    linesMerged.selectAll<SVGUseElement, Datum & TimelineLineRenderState>(`.${s.lineEndIcon}`)
      .data(d => [d])
      .attr('href', (d, i) => getString(d, config.lineEndIcon, i))
      .attr('x', (d, i) => {
        const lineLength = d._lengthCorrected
        const iconSize = d._endIconSize
        const iconArrangement = d._endIconArrangement
        const offset = iconArrangement === Arrangement.Inside ? -iconSize
          : iconArrangement === Arrangement.Center ? -iconSize / 2
            : 0
        return lineLength + offset
      })
      .attr('y', d => -((d._endIconSize - d._height) / 2) || 0)
      .attr('width', d => d._endIconSize)
      .attr('height', d => d._endIconSize)
      .style('color', d => d._endIconColor)

    const linesExit = lines.exit<Datum & TimelineLineRenderState>()
    smartTransition(linesExit, duration)
      .style('opacity', 0)
      .attr('transform', (d, i) => {
        const configuredPos = isFunction(config.animationLineExitPosition)
          ? config.animationLineExitPosition(d, i, lineDataPrepared)
          : config.animationLineExitPosition
        const [x, y] = [configuredPos?.[0] ?? d._xPx, configuredPos?.[1] ?? d._yPx]
        return `translate(${x}, ${y})`
      })
      .remove()

    // Arrows
    const arrowsData = this._prepareArrowsData(data, yOrdinalScale, rowHeight)
    const arrows = this._arrowsGroup.selectAll<SVGPathElement, TimelineArrow & TimelineArrowRenderState>(`.${s.arrow}`)
      .data(arrowsData ?? [], d => d.id)

    const arrowsEnter = arrows.enter().append('path')
      .attr('class', s.arrow)
      .style('opacity', 0)

    smartTransition(arrowsEnter.merge(arrows), duration)
      .attr('d', (d) => arrowPolylinePath(
        d._points,
        d.arrowHeadLength ?? TIMELINE_DEFAULT_ARROW_HEAD_LENGTH,
        d.arrowHeadWidth ?? TIMELINE_DEFAULT_ARROW_HEAD_WIDTH
      ))
      .style('opacity', 1)

    smartTransition(arrows.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Scroll Bar
    const absoluteContentHeight = recordTypes.length * rowHeight
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
    const clipPathRect = this._clipPath.select('rect')
    smartTransition(clipPathRect, clipPathRect.attr('width') ? duration : 0)
      .attr('x', xStart)
      .attr('width', timelineWidth)
      .attr('height', this._height)
  }

  private _getLineLength (d: Datum, i: number): number {
    const { config, xScale } = this
    const x = getNumber(d, config.x, i)
    const length = getNumber(d, config.lineDuration ?? config.length, i) ?? 0

    const lineLength = xScale(x + length) - xScale(x)
    return lineLength
  }

  private _getLineWidth (d: Datum, i: number, rowHeight: number): number {
    const { config } = this
    return getNumber(d, config.lineWidth, i) ?? Math.max(Math.floor(rowHeight / 2), 1)
  }

  private _getLineDuration (d: Datum, i: number): number {
    const { config } = this
    return getNumber(d, config.lineDuration ?? config.length, i) ?? 0
  }

  private _prepareLinesData (data: Datum[], rowOrdinalScale: ScaleOrdinal<string, number>, rowHeight: number): (Datum & TimelineLineRenderState)[] {
    const { config, xScale, yScale } = this
    const yRange = yScale.range()
    const yStart = Math.min(...yRange)

    return data.map((d, i) => {
      const id = getString(d, config.id, i) ?? [
        this._getRecordKey(d, i), getNumber(d, config.x, i),
      ].join('-')

      const lineWidth = this._getLineWidth(d, i, rowHeight)
      const lineLength = this._getLineLength(d, i)

      if (lineLength < 0) {
        console.warn('Unovis | Timeline: Line segments should not have negative lengths. Setting to 0.')
      }

      const isLineTooShort = config.showEmptySegments && config.lineCap && (lineLength < lineWidth)
      const lineLengthCorrected = config.showEmptySegments
        ? Math.max(config.lineCap ? lineWidth : 1, lineLength)
        : Math.max(0, lineLength)

      const x = xScale(getNumber(d, config.x, i))
      const y = yStart + rowOrdinalScale(this._getRecordKey(d, i)) * rowHeight + (rowHeight - lineWidth) / 2
      const xOffset = isLineTooShort ? -(lineLengthCorrected - lineLength) / 2 : 0

      return {
        ...d,
        _id: id,
        _xPx: x,
        _yPx: y,
        _xOffsetPx: xOffset,
        _length: lineLength,
        _height: lineWidth,
        _lengthCorrected: lineLengthCorrected,
        _startIconSize: getNumber(d, config.lineStartIconSize, i) ?? lineWidth,
        _endIconSize: getNumber(d, config.lineEndIconSize, i) ?? lineWidth,
        _startIconColor: getString(d, config.lineStartIconColor, i),
        _endIconColor: getString(d, config.lineEndIconColor, i),
        _startIconArrangement: getValue(d, config.lineStartIconArrangement, i) ?? Arrangement.Outside,
        _endIconArrangement: getValue(d, config.lineEndIconArrangement, i) ?? Arrangement.Outside,
      }
    })
  }

  private _prepareArrowsData (data: Datum[], rowOrdinalScale: ScaleOrdinal<string, number>, rowHeight: number): (TimelineArrow & TimelineArrowRenderState)[] {
    const { config } = this

    const arrowsData: (TimelineArrow & TimelineArrowRenderState)[] = config.arrows?.map(a => {
      const sourceLineIndex = data.findIndex((d, i) => getString(d, config.id, i) === a.lineSourceId)
      const targetLineIndex = data.findIndex((d, i) => getString(d, config.id, i) === a.lineTargetId)
      const sourceLine = data[sourceLineIndex]
      const targetLine = data[targetLineIndex]

      if (!sourceLine || !targetLine) {
        console.warn('Unovis | Timeline: Arrow references a non-existent line. Skipping...', a)
        return undefined
      }

      const sourceLineY = rowOrdinalScale(this._getRecordKey(sourceLine, sourceLineIndex)) * rowHeight + rowHeight / 2
      const targetLineY = rowOrdinalScale(this._getRecordKey(targetLine, targetLineIndex)) * rowHeight + rowHeight / 2
      const sourceLineWidth = this._getLineWidth(sourceLine, sourceLineIndex, rowHeight)
      const targetLineWidth = this._getLineWidth(targetLine, targetLineIndex, rowHeight)

      const x1 = (a.xSource
        ? this.xScale(a.xSource)
        : this.xScale(getNumber(sourceLine, config.x, sourceLineIndex)) + this._getLineLength(sourceLine, sourceLineIndex)
      ) + (a.xSourceOffsetPx ?? 0)
      const targetLineLength = this._getLineLength(targetLine, targetLineIndex)
      const isTargetLineTooShort = config.showEmptySegments && config.lineCap && (targetLineLength < targetLineWidth)
      const targetLineStart = this.xScale(getNumber(targetLine, config.x, targetLineIndex)) + (isTargetLineTooShort ? -targetLineWidth / 2 : 0)
      const x2 = (a.xTarget ? this.xScale(a.xTarget) : targetLineStart) + (a.xTargetOffsetPx ?? 0)
      const isX2OutsideTargetLineStart = (x2 < targetLineStart) || (x2 > targetLineStart)

      // Points array
      const sourceMargin = a.lineSourceMarginPx ?? TIMELINE_DEFAULT_ARROW_MARGIN
      const targetMargin = a.lineTargetMarginPx ?? TIMELINE_DEFAULT_ARROW_MARGIN
      const y1 = sourceLineY < targetLineY ? sourceLineY + sourceLineWidth / 2 + sourceMargin : sourceLineY - sourceLineWidth / 2 - sourceMargin
      const y2 = sourceLineY < targetLineY ? targetLineY - targetLineWidth / 2 - targetMargin : targetLineY + targetLineWidth / 2 + targetMargin
      const arrowHeadLength = a.arrowHeadLength ?? TIMELINE_DEFAULT_ARROW_HEAD_LENGTH
      const isForwardArrow = x1 < x2 && !isX2OutsideTargetLineStart
      const threshold = arrowHeadLength + (isForwardArrow ? targetMargin : 0)

      const points = [[x1, y1]] as [number, number][]
      if (Math.abs(x2 - x1) > threshold) {
        if (isForwardArrow) {
          points.push([x1, (y1 + targetLineY) / 2]) // A dummy point to enable smooth transitions when arrows change
          points.push([x1, targetLineY])
          points.push([x2 - targetMargin, targetLineY])
        } else {
          const verticalOffset = Math.sign(targetLineY - sourceLineY) * (rowHeight / 4)
          points.push([x1, y2 - verticalOffset])
          points.push([x2, y2 - verticalOffset])
          points.push([x2, y2])
        }
      } else {
        const quarterOffset = (y2 - y1) / 4
        points.push([x1, y1 + quarterOffset]) // A dummy point to enable smooth transitions
        points.push([x1, y1 + 3 * quarterOffset]) // A dummy point to enable smooth transitions
        points.push([x1, y2])
      }

      return {
        ...a,
        _points: points,
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
    this._rowIconsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    this._arrowsGroup.attr('transform', `translate(0,${-this._scrollDistance})`)
    const scrollBarPosition = (this._scrollDistance / this._maxScroll * (yHeight - this._scrollbarHeight)) || 0
    this._scrollBarHandle.attr('y', scrollBarPosition)
  }

  private _getRecordKey (d: Datum, i: number): string {
    return getString(d, this.config.lineRow ?? this.config.type) || `__${i}`
  }

  private _getRowLabels (data: Datum[]): TimelineRowLabel<Datum>[] {
    const grouped = groupBy(data, (d, i) => getString(d, this.config.lineRow ?? this.config.type) || `${i + 1}`)

    const rowLabels: TimelineRowLabel<Datum>[] = Object.entries(grouped).map(([key, items], i) => {
      const icon = this.config.rowIcon?.(key, items, i)
      return {
        label: key,
        formattedLabel: this.config.rowLabelFormatter?.(key, items, i) ?? key,
        iconHref: icon?.href,
        iconSize: icon?.size,
        iconColor: icon?.color,
        data: items,
      }
    })

    return rowLabels
  }

  // Override the default XYComponent getXDataExtent method to take into account line lengths
  getXDataExtent (): number[] {
    const { config, datamodel } = this
    const min = getMin(datamodel.data, config.x)
    const max = getMax(datamodel.data, (d, i) => getNumber(d, config.x, i) + (getNumber(d, config.lineDuration ?? config.length, i) ?? 0))
    return [min, max]
  }
}
