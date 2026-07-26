import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, dataRecords, fieldName, assertFieldsExist, baseSpec, distinctValues, field } from './shared.js'
import type { DataRecord } from './shared.js'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'hex color, e.g. #40C463')

const hexToRgb = (hex: string): number[] => {
  let h = hex.slice(1)
  if (h.length < 6) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** Evenly spaced hex stops between two colors (inclusive) — the heatmap builds
 * a quantized value → color scale from them, matching its 4-stop default */
const interpolateHexStops = (from: string, to: string, count: number): string[] => {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return `#${a.map((channel, c) => Math.round(channel + (b[c] - channel) * t).toString(16).padStart(2, '0')).join('')}`
  })
}

export const heatmapInputShape = {
  data: dataRecords,
  row: fieldName.describe('Field with the row category of each cell'),
  column: fieldName.describe('Field with the column category of each cell'),
  value: fieldName.describe('Field with the numeric cell value (drives the cell color)'),
  colorRange: z.tuple([hexColor, hexColor]).optional()
    .describe('[lowColor, highColor] hex pair; cell colors are interpolated between them. Defaults to a green sequence'),
  cellPadding: z.number().min(0).max(20).default(2).describe('Gap between cells in pixels'),
  cellCornerRadius: z.number().min(0).max(30).default(2).describe('Cell corner radius in pixels'),
  ...commonInput,
}

export const heatmapRecipe: Recipe<typeof heatmapInputShape> = {
  name: 'generate_heatmap',
  title: 'Heatmap',
  description: 'Generate a heatmap: a grid of cells colored by value across two categorical dimensions ' +
    '(e.g. activity by weekday × hour). Missing row/column combinations render as empty cells. ' +
    'Example: data=[{"day":"Mon","hour":"9am","visits":34},{"day":"Mon","hour":"10am","visits":51}], row="day", column="hour", value="visits".',
  inputShape: heatmapInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [input.row, input.column, input.value])

    // Distinct row/column names in first-seen order define the grid
    const rows = distinctValues(data, input.row).map(String)
    const columns = distinctValues(data, input.column).map(String)

    // Dense row-major grid — layout 'row' fills each row left-to-right.
    // Cells without a record keep a null value and render as empty cells.
    const cells = new Map<string, number>()
    for (const d of data) {
      const value = Number(d[input.value])
      if (d[input.value] === null || d[input.value] === '' || Number.isNaN(value)) continue
      cells.set(`${String(d[input.row])}\u0000${String(d[input.column])}`, value)
    }
    const grid = rows.flatMap(row => columns.map(column => ({
      row,
      column,
      value: cells.get(`${row}\u0000${column}`) ?? null,
    })))

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'Heatmap',
        config: {
          value: field('value', 'number'),
          layout: 'row',
          numRows: rows.length,
          numColumns: columns.length,
          rowLabel: { $lookup: rows },
          columnLabel: { $lookup: columns },
          cellPadding: input.cellPadding,
          cellCornerRadius: input.cellCornerRadius,
          ...(input.colorRange ? { colorRange: interpolateHexStops(input.colorRange[0], input.colorRange[1], 4) } : {}),
        },
      }],
      data: grid,
    }
  },
}
