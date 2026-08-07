import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, dataRecords, fieldName, assertFieldsExist, baseSpec, field } from './shared.js'
import type { DataRecord } from './shared.js'

export const donutInputShape = {
  data: dataRecords,
  value: fieldName().describe('Field with the numeric value of each segment'),
  label: fieldName().optional().describe('Field with the segment name (used for the legend)'),
  variant: z.enum(['donut', 'pie']).default('donut').describe('Donut (ring) or full pie'),
  arcWidth: z.number().min(2).max(200).optional().describe('Ring thickness in pixels (donut variant only)'),
  centralLabel: z.string().optional().describe('Text in the middle of the donut'),
  centralSubLabel: z.string().optional().describe('Smaller text under the central label'),
  padAngle: z.number().min(0).max(0.2).default(0).describe('Angular padding between segments, in radians'),
  sortDescending: z.boolean().default(false).describe('Sort segments by value, largest first'),
  showBackground: z.boolean().default(false).describe('Show a background ring behind the segments'),
  legend: z.boolean().default(true).describe('Show a legend (requires the label field)'),
  ...commonInput,
}

export const donutRecipe: Recipe<typeof donutInputShape> = {
  name: 'generate_donut_chart',
  title: 'Donut / pie chart',
  description: 'Generate a donut or pie chart showing parts of a whole. ' +
    'Example: data=[{"browser":"Chrome","share":65},{"browser":"Safari","share":19}], value="share", label="browser".',
  inputShape: donutInputShape,
  toSpec: (input) => {
    let data = input.data as DataRecord[]
    assertFieldsExist(data, [input.value, input.label])
    if (input.sortDescending) {
      data = [...data].sort((a, b) => Number(b[input.value]) - Number(a[input.value]))
    }

    const legend = input.legend && input.label
      ? data.map((d, i) => ({ name: String(d[input.label as string]), paletteIndex: i, color: input.colors?.[i % (input.colors.length || 1)] }))
      : undefined

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'Donut',
        config: {
          value: field(input.value, 'number'),
          arcWidth: input.variant === 'pie' ? 0 : (input.arcWidth ?? Math.round(Math.min(input.width, input.height) * 0.1)),
          centralLabel: input.centralLabel,
          centralSubLabel: input.centralSubLabel,
          padAngle: input.padAngle,
          showBackground: input.showBackground,
        },
      }],
      legend,
      data,
    }
  },
}
