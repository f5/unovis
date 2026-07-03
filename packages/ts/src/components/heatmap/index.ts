import { Selection } from 'd3-selection'
import { extent, range } from 'd3-array'
import { scaleQuantize } from 'd3-scale'

// Core
import { ComponentCore } from '@/core/component'
import { SeriesDataModel } from '@/data-models/series'

// Utils
import { smartTransition } from '@/utils/d3'
import { isNumber, getNumber, getString, clamp } from '@/utils/data'
import { getColor } from '@/utils/color'
import { getCSSVariableValue, getCSSVariableValueInPixels } from '@/utils/misc'
import { cssvar } from '@/utils/style'
import { getPreciseStringLengthPx } from '@/utils/text-measure'
import { roundedRectPath } from '@/utils/path'
import { hideOverlappingLabels } from '@/utils/text-overlap'

// Types
import { Spacing } from '@/types/spacing'
import { ExtendedSizeComponent, Sizing } from '@/types/component'

// Local Types
import { HeatmapCellDatum } from './types'

// Config
import { HeatmapDefaultConfig, HeatmapConfigInterface } from './config'

// Utils
import { getHeatmapGridSize, getHeatmapCellPosition, getHeatmapFixedCellDimensions, getHeatmapIntrinsicSize, resolveHeatmapCellSize } from './utils'

// Styles
import * as s from './style'

type ColumnLabelDatum = { column: number; label: string }
type RowLabelDatum = { row: number; label: string }

export class Heatmap<Datum> extends ComponentCore<Datum[], HeatmapConfigInterface<Datum>> implements ExtendedSizeComponent {
  static selectors = s
  protected _defaultConfig = HeatmapDefaultConfig as HeatmapConfigInterface<Datum>
  public config: HeatmapConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  cellsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  columnLabelsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  rowLabelsGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>

  events = {}

  /** Gap between a label and the grid in pixels. */
  private _labelPadding = 6
  private _labelCollisionAnimFrameId: ReturnType<typeof requestAnimationFrame>

  constructor (config?: HeatmapConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.cellsGroup = this.g.append('g')
    this.columnLabelsGroup = this.g.append('g')
    this.rowLabelsGroup = this.g.append('g')
  }

  get bleed (): Spacing {
    const { config } = this
    const fontSize = this._getLabelFontSize()
    const { rows } = this._getGridSize()

    let left = 0
    if (config.rowLabel) {
      const fontFamily = getCSSVariableValue(cssvar(s.variables.heatmapLabelFontFamily), this.element) ||
        getCSSVariableValue('var(--vis-font-family)', this.element)

      let maxWidth = 0
      for (let r = 0; r < rows; r += 1) {
        const labelText = config.rowLabel(r)
        if (labelText) maxWidth = Math.max(maxWidth, getPreciseStringLengthPx(labelText, fontFamily, fontSize))
      }
      if (maxWidth) left = maxWidth + this._labelPadding
    }

    const top = config.columnLabel ? fontSize + this._labelPadding : 0
    return { top, bottom: 0, left, right: 0 }
  }

  public getWidth (): number {
    if (!this._usesExtendedCellSize()) return this._width
    return this._getIntrinsicSize().width
  }

  public getHeight (): number {
    if (!this._usesExtendedCellSize()) return this._height
    return this._getIntrinsicSize().height
  }

  _render (customDuration?: number): void {
    const { config, datamodel, bleed } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
    const data = datamodel.data

    const { rows, columns } = this._getGridSize()
    const offset = config.offset || 0
    const gap = config.cellPadding ?? 0

    // Cell geometry
    const availW = this._width - bleed.left - bleed.right
    const availH = this._height - bleed.top - bleed.bottom
    const { cellWidth, cellHeight } = resolveHeatmapCellSize(config.cellSize, availW, availH, columns, rows, gap)
    const strideX = cellWidth + gap
    const strideY = cellHeight + gap
    const cornerRadius = config.cellCornerRadius === true ? 2 : (config.cellCornerRadius || 0)

    // Build cell records, collecting numeric values for the color scale domain
    const values: number[] = []
    const cellData: HeatmapCellDatum<Datum>[] = data.map((d, i) => {
      const value = getNumber(d, config.value, i)
      if (isNumber(value)) values.push(value)
      const gridIndex = i + offset
      const { row, column } = getHeatmapCellPosition(gridIndex, config.layout, rows, columns)
      return {
        datum: d,
        index: i,
        gridIndex,
        row,
        column,
        value,
        x: bleed.left + column * strideX,
        y: bleed.top + row * strideY,
        width: cellWidth,
        height: cellHeight,
      }
    })

    // Quantized value → color scale, used when the `color` accessor doesn't resolve
    const colorRange = config.colorRange ?? s.defaultColorRange
    const valuesExtent = extent(values)
    const colorDomain: [number, number] = config.colorDomain ??
      (isNumber(valuesExtent[0]) && isNumber(valuesExtent[1]) ? [valuesExtent[0], valuesExtent[1]] : [0, 1])
    const colorScale = scaleQuantize<string>().domain(colorDomain).range(colorRange)

    const emptyFill = cssvar(s.variables.heatmapCellFillColor)
    const getCellFill = (d: HeatmapCellDatum<Datum>): string => {
      if (config.color != null) {
        const c = getColor(d.datum, config.color, d.index, true)
        if (c) return c
      }
      if (!isNumber(d.value)) return emptyFill
      return colorScale(d.value)
    }

    const getCellPath = (d: HeatmapCellDatum<Datum>): string => {
      const r = clamp(cornerRadius, 0, Math.min(d.width, d.height) / 2)
      return roundedRectPath({ x: d.x, y: d.y, w: d.width, h: d.height, r, tl: true, tr: true, bl: true, br: true })
    }

    // Cells
    const cells = this.cellsGroup
      .selectAll<SVGPathElement, HeatmapCellDatum<Datum>>(`.${s.cell}`)
      .data(cellData, d => `${d.row}-${d.column}`)

    const cellsEnter = cells.enter().append('path')
      .attr('class', s.cell)
      .attr('d', getCellPath)
      .style('fill', getCellFill)
      .style('opacity', 0)

    const cellsMerged = cellsEnter.merge(cells)
    cellsMerged
      .classed(s.cellEmpty, d => !isNumber(d.value))
      .style('transition', duration ? `fill ${duration}ms` : null)
      .style('fill', getCellFill)
    if (config.cursor) cellsMerged.style('cursor', d => getString(d.datum, config.cursor, d.index))

    smartTransition(cellsMerged, duration)
      .attr('d', getCellPath)
      .style('opacity', 1)

    smartTransition(cells.exit(), duration)
      .style('opacity', 0)
      .remove()

    const columnLabels = this._renderColumnLabels(columns, strideX)
    const rowLabels = this._renderRowLabels(rows, strideY, cellHeight)
    this._resolveLabelOverlap(columnLabels, rowLabels)
  }

  private _renderColumnLabels (columns: number, strideX: number): Selection<SVGTextElement, ColumnLabelDatum, SVGGElement, unknown> {
    const { config, bleed } = this
    const columnLabel = config.columnLabel
    const labelData: ColumnLabelDatum[] = columnLabel
      ? range(columns)
        .map(column => ({ column, label: columnLabel(column) }))
        .filter((d): d is ColumnLabelDatum => d.label != null && d.label !== '')
      : []

    // Each label is wrapped in a <g> that owns the enter/exit fade, so the inner <text>
    // opacity can be driven independently by overlap resolution without fighting the transition.
    const labels = this.columnLabelsGroup
      .selectAll<SVGGElement, ColumnLabelDatum>('g')
      .data(labelData, d => `${d.column}`)

    const labelsEnter = labels.enter().append('g').style('opacity', 0)
    labelsEnter.append('text').attr('class', `${s.label} ${s.columnLabel}`)

    const labelsMerged = labelsEnter.merge(labels)
    const textMerged = labelsMerged.select<SVGTextElement>('text')
    textMerged
      .attr('x', d => bleed.left + d.column * strideX)
      .attr('y', Math.max(0, bleed.top - this._labelPadding))
      .text(d => d.label)

    smartTransition(labelsMerged, this.config.duration).style('opacity', 1)
    smartTransition(labels.exit(), this.config.duration).style('opacity', 0).remove()

    return textMerged
  }

  private _renderRowLabels (rows: number, strideY: number, cellHeight: number): Selection<SVGTextElement, RowLabelDatum, SVGGElement, unknown> {
    const { config, bleed } = this
    const rowLabel = config.rowLabel
    const labelData: RowLabelDatum[] = rowLabel
      ? range(rows)
        .map(row => ({ row, label: rowLabel(row) }))
        .filter((d): d is RowLabelDatum => d.label != null && d.label !== '')
      : []

    const labels = this.rowLabelsGroup
      .selectAll<SVGGElement, RowLabelDatum>('g')
      .data(labelData, d => `${d.row}`)

    const labelsEnter = labels.enter().append('g').style('opacity', 0)
    labelsEnter.append('text').attr('class', `${s.label} ${s.rowLabel}`)

    const labelsMerged = labelsEnter.merge(labels)
    const textMerged = labelsMerged.select<SVGTextElement>('text')
    textMerged
      .attr('x', Math.max(0, bleed.left - this._labelPadding))
      .attr('y', d => bleed.top + d.row * strideY + cellHeight / 2)
      .text(d => d.label)

    smartTransition(labelsMerged, this.config.duration).style('opacity', 1)
    smartTransition(labels.exit(), this.config.duration).style('opacity', 0).remove()

    return textMerged
  }

  /** Hides row/column labels that overlap their neighbours. Runs in the next frame so the
   * just-rendered labels can be measured without forcing a synchronous reflow. */
  private _resolveLabelOverlap (
    columnLabels: Selection<SVGTextElement, ColumnLabelDatum, SVGGElement, unknown>,
    rowLabels: Selection<SVGTextElement, RowLabelDatum, SVGGElement, unknown>
  ): void {
    if (!this.config.labelHideOverlapping) {
      columnLabels.style('opacity', null)
      rowLabels.style('opacity', null)
      return
    }

    // Resolve each axis independently — row and column labels live in separate regions
    // and never overlap one another.
    cancelAnimationFrame(this._labelCollisionAnimFrameId)
    this._labelCollisionAnimFrameId = requestAnimationFrame(() => {
      hideOverlappingLabels(columnLabels, { tolerance: -2 })
      hideOverlappingLabels(rowLabels, { tolerance: -2 })
    })
  }

  private _usesExtendedCellSize (): boolean {
    return (this.sizing === Sizing.Extend || this.sizing === Sizing.FitWidth) &&
      getHeatmapFixedCellDimensions(this.config.cellSize) != null
  }

  private _getIntrinsicSize (): { width: number; height: number } {
    const { config } = this
    const cellSize = getHeatmapFixedCellDimensions(config.cellSize)
    if (!cellSize) return { width: this._width, height: this._height }
    const { columns, rows } = this._getGridSize()
    const gap = config.cellPadding ?? 0
    return getHeatmapIntrinsicSize(cellSize, columns, rows, gap, this.bleed)
  }

  private _getGridSize (): { rows: number; columns: number } {
    const { config, datamodel } = this
    const total = datamodel.data.length + (config.offset || 0)
    return getHeatmapGridSize(total, config.layout, config.numRows, config.numColumns)
  }

  private _getLabelFontSize (): number {
    return getCSSVariableValueInPixels(cssvar(s.variables.heatmapLabelFontSize), this.element) || 12
  }

  protected _mapEventDatum (datum: HeatmapCellDatum<Datum>, index: number): { datum: unknown; index: number } {
    return { datum: datum?.datum, index: datum?.index ?? index }
  }
}
