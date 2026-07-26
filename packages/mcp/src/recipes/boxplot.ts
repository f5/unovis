import { z } from 'zod'

import type { Recipe } from './types.js'
import {
  commonInput,
  xyInput,
  dataRecords,
  fieldName,
  assertFieldsExist,
  baseSpec,
  categoryAxis,
  distinctValues,
  xyAxes,
  ChartInputError,
} from './shared.js'
import type { DataRecord } from './shared.js'

/** Linear-interpolated quantile of a sorted sample (R-7, matches d3.quantileSorted) */
const quantileSorted = (sorted: number[], p: number): number => {
  const h = (sorted.length - 1) * p
  const lo = Math.floor(h)
  const hi = Math.ceil(h)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo)
}

/** Trim float noise from computed stats (purely cosmetic for the config output) */
const round6 = (value: number): number => Math.round(value * 1e6) / 1e6

export const boxplotInputShape = {
  data: dataRecords,
  groupBy: fieldName.describe('Field with the group/category of each observation (one box per distinct value)'),
  value: fieldName.describe('Field with the numeric value of each observation'),
  boxPadding: z.number().min(0).max(0.9).default(0.25).describe('Fractional padding between boxes, 0..0.9'),
  boxMaxWidth: z.number().min(4).max(400).optional().describe('Maximum box width in pixels'),
  roundedCorners: z.number().min(0).max(20).default(2).describe('Corner radius of the boxes in pixels'),
  xAxisLabel: xyInput.xAxisLabel,
  yAxisLabel: xyInput.yAxisLabel,
  showGridLines: xyInput.showGridLines,
  ...commonInput,
}

export const boxplotRecipe: Recipe<typeof boxplotInputShape> = {
  name: 'generate_boxplot',
  title: 'Box plot',
  description: 'Generate a box-and-whisker plot comparing the distribution of a numeric value across groups. ' +
    'Pass raw (long-format) observations; quartiles, median, and Tukey whiskers (1.5×IQR, clamped to the data extent) are computed per group. ' +
    'Example: data=[{"service":"Auth","latency":132},{"service":"Auth","latency":89},{"service":"Search","latency":210},...], ' +
    'groupBy="service", value="latency".',
  inputShape: boxplotInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [input.groupBy, input.value])

    const groups = distinctValues(data, input.groupBy).map(String)
    if (!groups.length) throw new ChartInputError(`Field "${input.groupBy}" has no values to group by`)

    // One record per group with precomputed stats. Quartiles/whiskers are
    // stored as [low, high] arrays in the data (the Boxplot accessors must
    // return tuples, which accessor descriptors can't synthesize).
    const boxes = groups.map(group => {
      const values = data
        .filter(d => d[input.groupBy] !== null && d[input.groupBy] !== undefined && String(d[input.groupBy]) === group)
        .map(d => Number(d[input.value]))
        .filter(v => Number.isFinite(v))
        .sort((a, b) => a - b)
      if (!values.length) {
        throw new ChartInputError(`Group "${group}" has no numeric "${input.value}" values`)
      }
      const q1 = quantileSorted(values, 0.25)
      const median = quantileSorted(values, 0.5)
      const q3 = quantileSorted(values, 0.75)
      const iqr = q3 - q1
      const whiskerLow = Math.max(values[0], q1 - 1.5 * iqr)
      const whiskerHigh = Math.min(values[values.length - 1], q3 + 1.5 * iqr)
      return {
        group,
        median: round6(median),
        quartiles: [round6(q1), round6(q3)],
        whiskers: [round6(whiskerLow), round6(whiskerHigh)],
      }
    })

    const axes = xyAxes(input)

    return {
      container: 'xy',
      ...baseSpec(input),
      components: [{
        type: 'Boxplot',
        config: {
          x: { $index: true },
          median: { $field: 'median' },
          quartiles: { $field: 'quartiles' },
          whiskers: { $field: 'whiskers' },
          barPadding: input.boxPadding,
          ...(input.boxMaxWidth !== undefined ? { barMaxWidth: input.boxMaxWidth } : {}),
          roundedCorners: input.roundedCorners,
        },
      }],
      // Explicit integer tick values: with few categories, approximate d3
      // tick counts produce fractional ticks that round to duplicate labels
      xAxis: { ...categoryAxis(axes.xAxis, groups), gridLine: false, tickValues: groups.map((_, i) => i) },
      yAxis: { ...axes.yAxis, tickFormat: { $numTickFormat: true } },
      data: boxes,
    }
  },
}
