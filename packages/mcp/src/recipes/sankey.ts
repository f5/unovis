import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, baseSpec, ChartInputError } from './shared.js'

const sankeyNode = z.object({
  id: z.string().min(1),
  label: z.string().optional().describe('Display name (defaults to id)'),
}).describe('A node; optional if all nodes can be derived from links')

const sankeyLink = z.object({
  source: z.string().min(1).describe('Source node id'),
  target: z.string().min(1).describe('Target node id'),
  value: z.number().positive().describe('Flow volume'),
})

export const sankeyInputShape = {
  links: z.array(sankeyLink).min(1).describe('Flows between nodes, e.g. [{"source":"A","target":"B","value":10}]'),
  nodes: z.array(sankeyNode).optional().describe('Node definitions; derived from links when omitted'),
  nodeWidth: z.number().min(2).max(100).default(25).describe('Node bar width in pixels'),
  nodePadding: z.number().min(0).max(100).default(8).describe('Vertical padding between nodes'),
  showValues: z.boolean().default(true).describe('Show node totals as sub-labels'),
  valueSuffix: z.string().default('').describe('Unit appended to node values, e.g. " GB"'),
  ...commonInput,
}

export const sankeyRecipe: Recipe<typeof sankeyInputShape> = {
  name: 'generate_sankey_diagram',
  title: 'Sankey diagram',
  description: 'Generate a Sankey diagram visualizing flows between stages/nodes (e.g. traffic, budgets, energy). ' +
    'Provide links as {source, target, value}; nodes are derived automatically. The graph must be acyclic. ' +
    'Example: links=[{"source":"Salary","target":"Budget","value":5000},{"source":"Budget","target":"Rent","value":2000}].',
  inputShape: sankeyInputShape,
  toSpec: (input) => {
    const declared = new Map((input.nodes ?? []).map(n => [n.id, n]))
    const ids = new Set<string>()
    for (const link of input.links) {
      ids.add(link.source)
      ids.add(link.target)
      if (link.source === link.target) throw new ChartInputError(`Self-referencing link: "${link.source}" → "${link.target}"`)
    }
    for (const node of declared.keys()) ids.add(node)

    const nodes = Array.from(ids).map(id => ({
      id,
      label: declared.get(id)?.label ?? id,
    }))

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'Sankey',
        config: {
          label: { $field: 'label' },
          nodeWidth: input.nodeWidth,
          nodePadding: input.nodePadding,
          labelFit: 'trim',
          labelMaxWidth: Math.max(80, input.width * 0.16),
          ...(input.showValues ? { subLabel: { $format: { field: 'value', suffix: input.valueSuffix } } } : {}),
        },
      }],
      data: { nodes, links: input.links },
    }
  },
}
