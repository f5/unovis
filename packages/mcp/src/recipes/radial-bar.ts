import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, dataRecords, fieldName, assertFieldsExist, baseSpec, field } from './shared.js'
import type { DataRecord } from './shared.js'

export const radialBarInputShape = {
  data: dataRecords,
  value: fieldName.describe('Field with the numeric value of each ring'),
  label: fieldName.optional().describe('Field with the ring name (used for the legend)'),
  maxValue: z.number().positive().optional()
    .describe('Value at which a ring forms a full circle. Defaults to the largest value in the data'),
  arcWidth: z.number().min(2).max(100).default(16).describe('Ring thickness in pixels'),
  arcPadding: z.number().min(0).max(40).default(4).describe('Gap between rings in pixels'),
  cornerRadius: z.number().min(0).max(50).optional()
    .describe('Rounded bar ends, in pixels. Defaults to half the ring thickness'),
  centralLabel: z.string().optional().describe('Text in the middle of the rings'),
  centralSubLabel: z.string().optional().describe('Smaller text under the central label'),
  showBackground: z.boolean().default(true).describe('Show a faded full-circle track behind each ring'),
  legend: z.boolean().default(true).describe('Show a legend (requires the label field)'),
  ...commonInput,
}

export const radialBarRecipe: Recipe<typeof radialBarInputShape> = {
  name: 'generate_radial_bar_chart',
  title: 'Radial bar chart',
  description: 'Generate a radial bar chart (activity rings): one concentric ring per record, ' +
    'filled proportionally to its value. Good for progress toward goals or comparing a few values. ' +
    'Example: data=[{"metric":"Move","pct":84},{"metric":"Exercise","pct":62}], value="pct", label="metric", maxValue=100.',
  inputShape: radialBarInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [input.value, input.label])

    const legend = input.legend && input.label
      ? data.map((d, i) => ({ name: String(d[input.label as string]), paletteIndex: i, color: input.colors?.[i % (input.colors.length || 1)] }))
      : undefined

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'RadialBar',
        config: {
          value: field(input.value, 'number'),
          ...(input.maxValue !== undefined ? { maxValue: input.maxValue } : {}),
          trackWidth: input.arcWidth,
          trackPadding: input.arcPadding,
          cornerRadius: input.cornerRadius ?? Math.floor(input.arcWidth / 2),
          centralLabel: input.centralLabel,
          centralSubLabel: input.centralSubLabel,
          showBackground: input.showBackground,
        },
      }],
      legend,
      data,
    }
  },
}
