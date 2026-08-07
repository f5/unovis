import { z } from 'zod'

import type { Recipe } from './types.js'
import type { AxisSpec } from '../render/spec.js'
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
  toArray,
  xyAxes,
  xyDecorations,
  decorationComponents,
} from './shared.js'
import type { DataRecord } from './shared.js'

export const barInputShape = {
  data: dataRecords,
  x: fieldName().describe('Field for the category dimension (names or numbers)'),
  y: z.union([fieldName(), z.array(fieldName()).min(1).max(12)])
    .describe('Field name(s) for bar values. Multiple field names render one bar (or stack segment) per series'),
  type: z.enum(['grouped', 'stacked']).default('grouped')
    .describe('How multiple series are arranged: side-by-side groups or stacks'),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical')
    .describe('Bar direction. Horizontal puts categories on the Y axis'),
  seriesLabels: z.array(z.string()).optional().describe('Display names for the series (legend). Defaults to field names'),
  roundedCorners: z.boolean().default(true).describe('Round the outer bar corners'),
  barPadding: z.number().min(0).max(0.9).optional().describe('Padding between bars within a group, 0..0.9'),
  ...xyDecorations,
  ...xyInput,
  ...commonInput,
}

export const barRecipe: Recipe<typeof barInputShape> = {
  name: 'generate_bar_chart',
  title: 'Bar chart',
  description: 'Generate a bar chart: single-series, grouped, or stacked; vertical or horizontal. ' +
    'Use for comparing values across categories. ' +
    'Example: data=[{"country":"US","gold":9,"silver":8},...], x="country", y=["gold","silver"], type="stacked".',
  inputShape: barInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    const yFields = toArray(input.y)
    assertFieldsExist(data, [input.x, ...yFields])

    const horizontal = input.orientation === 'horizontal'
    const { x, categories } = categoricalX(data, input.x)
    const labels = input.seriesLabels?.length ? input.seriesLabels : yFields
    const axes = xyAxes(input)

    // The category axis is X for vertical bars and Y for horizontal ones —
    // value/category axis labels swap accordingly.
    let xAxis: AxisSpec = { ...axes.xAxis }
    let yAxis: AxisSpec = { ...axes.yAxis, tickFormat: { $numTickFormat: true } }
    if (categories) {
      const catAxis = categoryAxis(horizontal ? axes.yAxis : axes.xAxis, categories)
      if (horizontal) {
        yAxis = { ...catAxis, gridLine: false }
        xAxis = { ...axes.xAxis, tickFormat: { $numTickFormat: true } }
      } else {
        xAxis = { ...catAxis, gridLine: false }
      }
    }

    const deco = decorationComponents(input)
    return {
      container: 'xy',
      ...baseSpec(input),
      components: [...deco.bands, {
        type: input.type === 'stacked' ? 'StackedBar' : 'GroupedBar',
        config: {
          x,
          y: yFields.map(f => field(f, 'number')),
          orientation: input.orientation,
          roundedCorners: input.roundedCorners,
          ...(input.barPadding !== undefined ? { barPadding: input.barPadding } : {}),
        },
      }, ...deco.lines],
      xAxis,
      yAxis,
      legend: seriesLegend(labels, input.legend, input.colors),
      data,
    }
  },
}
