import { z } from 'zod'

import type { Recipe } from './types.js'
import type { ComponentSpec } from '../render/spec.js'
import {
  commonInput,
  xyInput,
  dataRecords,
  fieldName,
  assertFieldsExist,
  baseSpec,
  categoricalX,
  categoryAxis,
  field,
  seriesLegend,
  timeTickValuesFromData,
  toArray,
  xyAxes,
  xyDecorations,
  decorationComponents,
} from './shared.js'
import type { DataRecord } from './shared.js'

/** Series color: custom palette entries cycle; otherwise theme palette variables
 * (resolved to literal colors per theme during SVG post-processing) */
const seriesColor = (i: number, colors?: string[]): string =>
  colors?.length ? colors[i % colors.length] : `var(--vis-color${i % 6})`

export const areaInputShape = {
  data: dataRecords,
  x: fieldName.describe('Field for X values: numbers, or date strings when xIsTime is true, or category names'),
  y: z.union([fieldName, z.array(fieldName).min(1).max(12)])
    .describe('Field name(s) for Y values. Multiple field names render multiple areas'),
  stacked: z.boolean().default(true)
    .describe('Stack multiple y series on top of each other. When false, series overlap with transparency'),
  curve: z.enum(['linear', 'monotoneX', 'basis', 'natural', 'step', 'stepAfter', 'stepBefore']).default('monotoneX')
    .describe('Area interpolation type'),
  xIsTime: z.boolean().default(false).describe('Treat x values as dates/timestamps (time axis)'),
  seriesLabels: z.array(z.string()).optional().describe('Display names for the y series (legend). Defaults to field names'),
  ...xyDecorations,
  ...xyInput,
  ...commonInput,
}

export const areaRecipe: Recipe<typeof areaInputShape> = {
  name: 'generate_area_chart',
  title: 'Area chart',
  description: 'Generate an area chart for volumes/magnitudes over a continuous or time dimension. ' +
    'Multiple y fields are stacked by default; set stacked=false to overlay them with transparency. ' +
    'Example: data=[{"month":"2024-01","mobile":120,"desktop":80},...], x="month", xIsTime=true, y=["mobile","desktop"].',
  inputShape: areaInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    const yFields = toArray(input.y)
    assertFieldsExist(data, [input.x, ...yFields])

    const { x, categories } = categoricalX(data, input.x, input.xIsTime)
    const axes = xyAxes(input)
    const labels = input.seriesLabels?.length ? input.seriesLabels : yFields

    // Stacked: one Area component with multiple y accessors (colored by the
    // palette per stack layer). Overlaid: one semi-transparent Area component
    // per series — each needs an explicit color, otherwise all would resolve
    // to the first palette color.
    const overlaid = !input.stacked && yFields.length > 1
    const components: ComponentSpec[] = overlaid
      ? yFields.map((f, i) => ({
        type: 'Area',
        config: {
          x,
          y: field(f, 'number'),
          curveType: input.curve,
          opacity: 0.45,
          color: seriesColor(i, input.colors),
        },
      }))
      : [{
        type: 'Area',
        config: {
          x,
          y: yFields.map(f => field(f, 'number')),
          curveType: input.curve,
        },
      }]

    const deco = decorationComponents(input)
    return {
      container: 'xy',
      ...baseSpec(input),
      components: [...deco.bands, ...components, ...deco.lines],
      xAxis: {
        ...(categories ? categoryAxis(axes.xAxis, categories) : axes.xAxis),
        ...(input.xIsTime
          ? { tickFormat: { $dateTickFormat: true }, tickValues: timeTickValuesFromData(data, input.x) }
          : {}),
      },
      yAxis: { ...axes.yAxis, tickFormat: { $numTickFormat: true } },
      legend: seriesLegend(labels, input.legend, input.colors),
      data,
    }
  },
}
