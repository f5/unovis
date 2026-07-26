import { z } from 'zod'

import type { Recipe } from './types.js'
import type { AccessorRef } from '../render/spec.js'
import { commonInput, baseSpec, seriesLegend, ChartInputError } from './shared.js'

/** Category color: custom palette entries cycle; otherwise theme palette variables
 * (resolved to literal colors per theme during SVG post-processing) */
const categoryColor = (i: number, colors?: string[]): string =>
  colors?.length ? colors[i % colors.length] : `var(--vis-color${i % 6})`

/** Neutral grey for nodes without a group when other nodes have one (works on both themes) */
const UNKNOWN_GROUP_COLOR = '#94A0AB'

const graphNode = z.object({
  id: z.string().min(1).describe('Unique node id'),
  label: z.string().optional().describe('Display name (defaults to id)'),
  group: z.string().optional().describe('Category the node belongs to — drives node color (and ring placement in the concentric layout)'),
  size: z.number().min(4).max(200).optional().describe('Node diameter in pixels (defaults to nodeSize)'),
  subLabel: z.string().optional().describe('Smaller text under the node label'),
})

const graphLink = z.object({
  source: z.string().min(1).describe('Source node id'),
  target: z.string().min(1).describe('Target node id'),
  label: z.string().optional().describe('Short badge label drawn on the link (keep it within a few characters)'),
  width: z.number().min(0.5).max(20).optional().describe('Link stroke width in pixels (defaults to linkWidth)'),
})

export const graphInputShape = {
  nodes: z.array(graphNode).min(1).max(300)
    .describe('Graph nodes, e.g. [{"id":"gw","label":"Gateway","group":"service"}]'),
  links: z.array(graphLink).max(1000)
    .describe('Edges between nodes by id, e.g. [{"source":"gw","target":"db"}]'),
  // dagre is omitted: @unovis/graphlibrary's dist has extensionless ESM
  // imports (lodash-es/reduce) that no plain-Node runtime can resolve
  layout: z.enum(['force', 'circular', 'concentric']).default('force')
    .describe('Node placement: force (organic, general networks), circular (single ring), ' +
      'concentric (one ring per group)'),
  nodeSize: z.number().min(4).max(100).default(22).describe('Default node diameter in pixels'),
  showLabels: z.boolean().default(true).describe('Show node labels'),
  linkArrows: z.boolean().default(false).describe('Draw source → target arrowheads on links'),
  linkWidth: z.number().min(0.5).max(20).default(1.5).describe('Default link stroke width in pixels'),
  legend: z.boolean().default(true).describe('Show a legend when nodes have groups'),
  ...commonInput,
  height: z.number().int().min(100).max(4000).default(600).describe('Chart height in pixels'),
}

export const graphRecipe: Recipe<typeof graphInputShape> = {
  name: 'generate_network_graph',
  title: 'Network graph',
  description: 'Generate a network graph (node-link diagram) of relationships between entities — ' +
    'topologies, dependencies, hierarchies, social networks. Nodes are colored by their optional group. ' +
    'Use layout "force" for general networks, "circular"/"concentric" for symmetric views. ' +
    'Example: nodes=[{"id":"api","group":"service"},{"id":"db","group":"storage"}], links=[{"source":"api","target":"db"}].',
  inputShape: graphInputShape,
  toSpec: (input) => {
    const ids = new Set<string>()
    const duplicates = new Set<string>()
    for (const node of input.nodes) {
      if (ids.has(node.id)) duplicates.add(node.id)
      ids.add(node.id)
    }
    if (duplicates.size) {
      throw new ChartInputError(`Duplicate node id${duplicates.size > 1 ? 's' : ''}: ${[...duplicates].map(d => `"${d}"`).join(', ')}`)
    }

    const unknown = new Set<string>()
    for (const link of input.links) {
      if (!ids.has(link.source)) unknown.add(link.source)
      if (!ids.has(link.target)) unknown.add(link.target)
      // The graph data model silently drops self-referencing links — reject
      // them instead so the output never misrepresents the input
      if (link.source === link.target) throw new ChartInputError(`Self-referencing link: "${link.source}" → "${link.source}". Links must connect two distinct nodes`)
    }
    if (unknown.size) {
      throw new ChartInputError(
        `Link endpoint${unknown.size > 1 ? 's' : ''} ${[...unknown].map(d => `"${d}"`).join(', ')} not found in nodes. ` +
        'Every link source/target must match a node id')
    }

    // Distinct groups in first-seen order map onto the palette; the legend
    // mirrors the same order/colors (scatter colorBy pattern)
    const groups: string[] = []
    for (const node of input.nodes) {
      if (node.group !== undefined && !groups.includes(node.group)) groups.push(node.group)
    }
    const mapping: Record<string, string> = {}
    groups.forEach((group, i) => { mapping[group] = categoryColor(i, input.colors) })
    // Ungrouped graphs get the first palette color — the library default
    // (hollow theme-colored circles) reads as unstyled in a generated chart
    const nodeFill: AccessorRef | string = groups.length
      ? { $mapField: { field: 'group', mapping, fallback: UNKNOWN_GROUP_COLOR } }
      : categoryColor(0, input.colors)
    const legend = seriesLegend(groups, input.legend, input.colors)

    // Normalize data so field accessors never hit undefined values
    const anyNodeSize = input.nodes.some(n => n.size !== undefined)
    const anySubLabel = input.nodes.some(n => n.subLabel !== undefined)
    const nodes = input.nodes.map(n => ({
      id: n.id,
      label: n.label ?? n.id,
      ...(n.group !== undefined ? { group: n.group } : {}),
      ...(anyNodeSize ? { size: n.size ?? input.nodeSize } : {}),
      ...(anySubLabel ? { subLabel: n.subLabel ?? '' } : {}),
    }))

    const anyLinkWidth = input.links.some(l => l.width !== undefined)
    const anyLinkLabel = input.links.some(l => l.label !== undefined)
    const links = input.links.map(l => ({
      source: l.source,
      target: l.target,
      ...(anyLinkWidth ? { width: l.width ?? input.linkWidth } : {}),
      // linkLabel expects a GraphCircleLabel object ({ text })
      ...(l.label !== undefined ? { label: { text: l.label } } : {}),
    }))

    return {
      container: 'single',
      ...baseSpec(input),
      components: [{
        type: 'Graph',
        config: {
          layoutType: input.layout,
          // Top-to-bottom reads naturally for generated hierarchies (lib default is bottom-to-top)
          nodeLabel: input.showLabels ? { $field: 'label' } : '',
          ...(input.showLabels && anySubLabel ? { nodeSubLabel: { $field: 'subLabel' } } : {}),
          nodeSize: anyNodeSize ? { $field: 'size', as: 'number' } : input.nodeSize,
          nodeFill,
          linkWidth: anyLinkWidth ? { $field: 'width', as: 'number' } : input.linkWidth,
          ...(input.linkArrows ? { linkArrow: 'single' } : {}),
          ...(anyLinkLabel ? { linkLabel: { $field: 'label' } } : {}),
          // Headless render: let fit-to-view zoom out further than the
          // interactive default so large layouts are never clipped
          zoomScaleExtent: [0.05, 1.25],
        },
      }],
      legend,
      data: { nodes, links },
    }
  },
}
