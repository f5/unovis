import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, dataRecords, fieldName, assertFieldsExist, baseSpec, field } from './shared.js'
import type { DataRecord } from './shared.js'

export const nestedDonutInputShape = {
  data: dataRecords,
  layers: z.array(fieldName()).min(1).max(4)
    .describe('Fields defining the hierarchy rings, innermost ring first, e.g. ["region", "country"]'),
  value: fieldName().optional()
    .describe('Field with the numeric segment weight. Records are counted when omitted'),
  centralLabel: z.string().optional().describe('Text in the middle of the donut'),
  centralSubLabel: z.string().optional().describe('Smaller text under the central label'),
  layerPadding: z.number().min(0).max(20).default(0).describe('Gap between rings in pixels'),
  cornerRadius: z.number().min(0).max(20).default(0).describe('Segment corner radius in pixels'),
  showSegmentLabels: z.boolean().default(true).describe('Show the category name on each segment (labels that do not fit are hidden)'),
  ...commonInput,
}

export const nestedDonutRecipe: Recipe<typeof nestedDonutInputShape> = {
  name: 'generate_nested_donut_chart',
  title: 'Nested donut / sunburst chart',
  description: 'Generate a nested donut (sunburst) chart showing hierarchical part-of-whole data as concentric rings, ' +
    'innermost ring first. Segments are sized by the value field, or by record count when it is omitted. ' +
    'Example: data=[{"region":"EMEA","country":"Germany","sales":420},{"region":"EMEA","country":"France","sales":310}], layers=["region","country"], value="sales".',
  inputShape: nestedDonutInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [...input.layers, input.value])

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'NestedDonut',
        config: {
          layers: input.layers.map(layer => field(layer)),
          // 'outwards' places layers[0] on the innermost ring, leaves outward
          direction: 'outwards',
          ...(input.value ? { value: field(input.value, 'number') } : {}),
          centralLabel: input.centralLabel,
          centralSubLabel: input.centralSubLabel,
          layerPadding: input.layerPadding,
          cornerRadius: input.cornerRadius,
          showSegmentLabels: input.showSegmentLabels,
        },
      }],
      data,
    }
  },
}
