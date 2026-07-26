import { z } from 'zod'

import type { Recipe } from './types.js'
import type { AccessorRef, LegendItemSpec } from '../render/spec.js'
import { commonInput, xyInput, dataRecords, fieldName, assertFieldsExist, baseSpec, distinctValues, field, seriesLegend, xyAxes } from './shared.js'
import type { DataRecord } from './shared.js'

/** Category color: custom palette entries cycle; otherwise theme palette variables
 * (resolved to literal colors per theme during SVG post-processing) */
const categoryColor = (i: number, colors?: string[]): string =>
  colors?.length ? colors[i % colors.length] : `var(--vis-color${i % 6})`

/** Neutral grey for points whose category is missing (works on both themes) */
const UNKNOWN_CATEGORY_COLOR = '#94A0AB'

export const scatterInputShape = {
  data: dataRecords,
  x: fieldName.describe('Field for X values (numeric)'),
  y: fieldName.describe('Field for Y values (numeric)'),
  size: fieldName.optional()
    .describe('Numeric field mapped to point size (bubble chart). Values are scaled into sizeRange'),
  sizeRange: z.tuple([z.number().min(1).max(200), z.number().min(1).max(200)]).default([8, 40])
    .describe('Point diameter range [min, max] in pixels, used when size is set'),
  pointSize: z.number().min(1).max(100).default(10)
    .describe('Fixed point diameter in pixels, used when size is not set'),
  colorBy: fieldName.optional()
    .describe('Categorical field: points are colored by its value and a legend is shown'),
  label: fieldName.optional()
    .describe('Field with point labels. Overlapping labels are hidden automatically'),
  shape: z.enum(['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye']).default('circle')
    .describe('Point shape'),
  ...xyInput,
  ...commonInput,
}

export const scatterRecipe: Recipe<typeof scatterInputShape> = {
  name: 'generate_scatter_plot',
  title: 'Scatter plot',
  description: 'Generate a scatter plot (or bubble chart) showing the relationship between two numeric fields. ' +
    'Optional: size field for bubbles, colorBy category field for colored groups with a legend, label field for point labels. ' +
    'Example: data=[{"gdp":43000,"lifeExp":81.2,"pop":38.2,"region":"Europe","country":"..."},...], ' +
    'x="gdp", y="lifeExp", size="pop", colorBy="region", label="country".',
  inputShape: scatterInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [input.x, input.y, input.size, input.colorBy, input.label])

    // Categorical coloring: distinct categories map onto the palette in
    // first-seen order; the legend mirrors the same order/colors.
    let color: AccessorRef | undefined
    let legend: LegendItemSpec[] | undefined
    if (input.colorBy) {
      const categories = distinctValues(data, input.colorBy).map(String)
      const mapping: Record<string, string> = {}
      categories.forEach((category, i) => { mapping[category] = categoryColor(i, input.colors) })
      color = { $mapField: { field: input.colorBy, mapping, fallback: UNKNOWN_CATEGORY_COLOR } }
      legend = seriesLegend(categories, input.legend, input.colors)
    }

    const axes = xyAxes(input)

    return {
      container: 'xy',
      ...baseSpec(input),
      components: [{
        type: 'Scatter',
        config: {
          x: field(input.x, 'number'),
          y: field(input.y, 'number'),
          shape: input.shape,
          ...(input.size
            ? { size: field(input.size, 'number'), sizeRange: input.sizeRange }
            : { size: input.pointSize }),
          ...(color ? { color } : {}),
          ...(input.label ? { label: { $field: input.label } } : {}),
        },
      }],
      xAxis: { ...axes.xAxis, tickFormat: { $numTickFormat: true } },
      yAxis: { ...axes.yAxis, tickFormat: { $numTickFormat: true } },
      legend,
      data,
    }
  },
}
