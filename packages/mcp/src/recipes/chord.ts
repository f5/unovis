import { z } from 'zod'

import type { Recipe } from './types.js'
import { commonInput, baseSpec, ChartInputError } from './shared.js'

const chordNode = z.object({
  id: z.string().min(1),
  label: z.string().optional().describe('Display name (defaults to id)'),
}).describe('A node; optional if all nodes can be derived from links')

const chordLink = z.object({
  source: z.string().min(1).describe('Source node id'),
  target: z.string().min(1).describe('Target node id'),
  value: z.number().positive().describe('Connection strength / flow volume'),
})

/** Size of the default Unovis palette (--vis-color0..5) */
const PALETTE_SIZE = 6

export const chordInputShape = {
  links: z.array(chordLink).min(1)
    .describe('Weighted connections between nodes, e.g. [{"source":"A","target":"B","value":10}]'),
  nodes: z.array(chordNode).optional().describe('Node definitions; derived from links when omitted'),
  nodeWidth: z.number().min(2).max(100).default(15).describe('Thickness of the node arcs in pixels'),
  padAngle: z.number().min(0).max(0.5).default(0.02).describe('Angular padding between nodes, in radians'),
  cornerRadius: z.number().min(0).max(20).default(2).describe('Corner radius of the node arcs in pixels'),
  labelAlignment: z.enum(['along', 'perpendicular']).default('along')
    .describe('Node labels drawn along the arcs, or radiating outwards perpendicular to them'),
  ...commonInput,
}

export const chordRecipe: Recipe<typeof chordInputShape> = {
  name: 'generate_chord_diagram',
  title: 'Chord diagram',
  description: 'Generate a chord diagram visualizing weighted relationships within one set of entities ' +
    '(e.g. trade between countries, brand switching, team interactions). Provide links as {source, target, value}; ' +
    'nodes are derived automatically. Self-links (source === target) are not supported. ' +
    'Example: links=[{"source":"Apple","target":"Samsung","value":8},{"source":"Samsung","target":"Apple","value":14}].',
  inputShape: chordInputShape,
  toSpec: (input) => {
    const declared = new Map((input.nodes ?? []).map(n => [n.id, n]))
    const ids = new Set<string>()
    for (const link of input.links) {
      ids.add(link.source)
      ids.add(link.target)
      // The graph data model silently drops self-referencing links — reject
      // them instead so the output never misrepresents the input
      if (link.source === link.target) throw new ChartInputError(`Self-referencing link: "${link.source}" → "${link.target}". Chord diagrams only show links between distinct nodes`)
    }
    for (const id of declared.keys()) ids.add(id)

    // Cycle the palette per node — the component's default node/label color
    // accessors read the `color` property of each node
    const paletteSize = input.colors?.length || PALETTE_SIZE
    const nodes = Array.from(ids).map((id, i) => ({
      id,
      label: declared.get(id)?.label ?? id,
      color: `var(--vis-color${i % paletteSize})`,
    }))

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'ChordDiagram',
        config: {
          nodeLabel: { $field: 'label' },
          linkValue: { $field: 'value' },
          nodeWidth: input.nodeWidth,
          padAngle: input.padAngle,
          cornerRadius: input.cornerRadius,
          nodeLabelAlignment: input.labelAlignment,
        },
      }],
      data: { nodes, links: input.links },
    }
  },
}
