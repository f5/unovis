import { Spacing } from 'types/spacing'

import { HeatmapLayoutType } from './types'

/** Resolves fixed `[width, height]` from `cellSize`, or `null` when cells should stretch. */
export function getHeatmapFixedCellDimensions (cellSize?: number | [number, number]): [number, number] | null {
  if (cellSize == null) return null
  return Array.isArray(cellSize) ? cellSize : [cellSize, cellSize]
}

/** Computes the grid's pixel size from fixed `cellSize`, grid dimensions, gap, and label bleed. */
export function getHeatmapIntrinsicSize (
  cellSize: number | [number, number],
  columns: number,
  rows: number,
  gap: number,
  bleed: Spacing
): { width: number; height: number } {
  const [cellWidth, cellHeight] = getHeatmapFixedCellDimensions(cellSize) as [number, number]
  return {
    width: bleed.left + columns * cellWidth + Math.max(0, columns - 1) * gap + bleed.right,
    height: bleed.top + rows * cellHeight + Math.max(0, rows - 1) * gap + bleed.bottom,
  }
}

/** Resolves cell width and height from `cellSize` and the available grid area. */
export function resolveHeatmapCellSize (
  cellSize: number | [number, number] | undefined,
  availW: number,
  availH: number,
  columns: number,
  rows: number,
  gap: number
): { cellWidth: number; cellHeight: number } {
  const fixed = getHeatmapFixedCellDimensions(cellSize)
  if (fixed) return { cellWidth: fixed[0], cellHeight: fixed[1] }
  return {
    cellWidth: Math.max(0, (availW - (columns - 1) * gap) / columns),
    cellHeight: Math.max(0, (availH - (rows - 1) * gap) / rows),
  }
}

/** Resolves the grid dimensions from the total number of cells, the fill layout, and any explicit dimensions. */
export function getHeatmapGridSize (
  total: number,
  layout: HeatmapLayoutType,
  numRows?: number,
  numColumns?: number
): { rows: number; columns: number } {
  const n = Math.max(0, total)
  if (layout === HeatmapLayoutType.Row) {
    const columns = Math.max(1, numColumns ?? 7)
    const rows = Math.max(1, numRows ?? (Math.ceil(n / columns) || 1))
    return { rows, columns }
  }

  const rows = Math.max(1, numRows ?? 7)
  const columns = Math.max(1, numColumns ?? (Math.ceil(n / rows) || 1))
  return { rows, columns }
}

/** Maps a position in the linear sequence to its `{ row, column }` in the grid. */
export function getHeatmapCellPosition (
  gridIndex: number,
  layout: HeatmapLayoutType | `${HeatmapLayoutType}`,
  rows: number,
  columns: number
): { row: number; column: number } {
  if (layout === HeatmapLayoutType.Row) {
    return { row: Math.floor(gridIndex / columns), column: gridIndex % columns }
  }

  return { row: gridIndex % rows, column: Math.floor(gridIndex / rows) }
}
