import { z } from 'zod'

import type { Recipe } from './types.js'
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

export const lineInputShape = {
  data: dataRecords,
  x: fieldName.describe('Field for X values: numbers, or date strings when xIsTime is true, or category names'),
  y: z.union([fieldName, z.array(fieldName).min(1).max(12)])
    .describe('Field name(s) for Y values. Multiple field names render multiple lines'),
  xIsTime: z.boolean().default(false).describe('Treat x values as dates/timestamps (time axis)'),
  seriesLabels: z.array(z.string()).optional().describe('Display names for the y series (legend). Defaults to field names'),
  lineWidth: z.number().min(0.5).max(20).default(2).describe('Line stroke width in pixels'),
  curve: z.enum(['linear', 'monotoneX', 'basis', 'natural', 'step', 'stepAfter', 'stepBefore']).default('monotoneX')
    .describe('Line interpolation type'),
  interpolateMissing: z.boolean().default(false)
    .describe('Draw dashed interpolated segments across missing (null) values instead of gaps'),
  yDomainMin: z.number().optional().describe('Force the Y axis to start at this value'),
  yDomainMax: z.number().optional().describe('Force the Y axis to end at this value'),
  ...xyDecorations,
  ...xyInput,
  ...commonInput,
}

export const lineRecipe: Recipe<typeof lineInputShape> = {
  name: 'generate_line_chart',
  title: 'Line chart',
  description: 'Generate a line chart (single or multi-series) for trends over a continuous or time dimension. ' +
    'Data is an array of flat records; x and y reference field names. ' +
    'Example: data=[{"month":"2024-01","sales":120,"cost":80},...], x="month", xIsTime=true, y=["sales","cost"].',
  inputShape: lineInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    const yFields = toArray(input.y)
    assertFieldsExist(data, [input.x, ...yFields])

    const { x, categories } = categoricalX(data, input.x, input.xIsTime)
    const axes = xyAxes(input)
    const labels = input.seriesLabels?.length ? input.seriesLabels : yFields

    const deco = decorationComponents(input)
    return {
      container: 'xy',
      ...baseSpec(input),
      components: [...deco.bands, {
        type: 'Line',
        config: {
          x,
          y: yFields.map(f => field(f, 'number')),
          lineWidth: input.lineWidth,
          curveType: input.curve,
          interpolateMissingData: input.interpolateMissing,
        },
      }, ...deco.lines],
      xAxis: {
        ...(categories ? categoryAxis(axes.xAxis, categories) : axes.xAxis),
        ...(input.xIsTime
          ? { tickFormat: { $dateTickFormat: true }, tickValues: timeTickValuesFromData(data, input.x) }
          : {}),
      },
      yAxis: { ...axes.yAxis, tickFormat: { $numTickFormat: true } },
      containerConfig: (input.yDomainMin !== undefined || input.yDomainMax !== undefined)
        ? { yDomain: [input.yDomainMin, input.yDomainMax] }
        : undefined,
      legend: seriesLegend(labels, input.legend, input.colors),
      data,
    }
  },
}
