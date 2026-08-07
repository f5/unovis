import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, dataRecords, fieldName, assertFieldsExist, baseSpec, field } from './shared.js'
import type { DataRecord } from './shared.js'

export const treemapInputShape = {
  data: dataRecords,
  layers: z.array(fieldName()).min(1).max(4)
    .describe('Fields defining the hierarchy, top-level groups first, e.g. ["sector", "company"]'),
  value: fieldName().describe('Field with the numeric tile size'),
  labelInternalNodes: z.boolean().optional()
    .describe('Show labels on the group (non-leaf) tiles. Defaults to true when there is more than one layer'),
  tilePadding: z.number().min(0).max(24).default(2).describe('Padding between tiles in pixels'),
  ...commonInput,
}

export const treemapRecipe: Recipe<typeof treemapInputShape> = {
  name: 'generate_treemap',
  title: 'Treemap',
  description: 'Generate a treemap of nested rectangles sized by value. Use for part-of-whole comparisons, ' +
    'optionally across hierarchy levels. Tiles are labeled "name: value". ' +
    'Example: data=[{"sector":"Tech","company":"Apple","cap":2900},{"sector":"Energy","company":"Shell","cap":210}], layers=["sector","company"], value="cap".',
  inputShape: treemapInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    assertFieldsExist(data, [...input.layers, input.value])

    const labelInternalNodes = input.labelInternalNodes ?? input.layers.length > 1

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'Treemap',
        config: {
          layers: input.layers.map(layer => field(layer)),
          value: field(input.value, 'number'),
          labelInternalNodes,
          tilePadding: input.tilePadding,
          // Group labels render inside the group tile — reserve headroom for them
          ...(labelInternalNodes ? { tilePaddingTop: 22 } : {}),
          tileShowHtmlTooltip: false,
        },
      }],
      data,
    }
  },
}
