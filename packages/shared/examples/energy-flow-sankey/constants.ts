import { Sankey, SankeyNode, SankeyLink, colors, getLighterColor } from '@unovis/ts'
import { data, DataRecord } from './data'
export { FitMode, SankeyNodeAlign } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { focus: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type NodeDatum = { id: string }
export const initialState: ExampleState = { focus: 'all' }
export const focusOptions = [
  { value: 'all', label: 'All energy sources and uses' },
  { value: 'electricity', label: 'Electricity conversion only' },
]
export const palette: Record<string, string> = Object.fromEntries([
  ['Coal', colors[5]],
  ['Natural gas', colors[2]],
  ['Petroleum', colors[1]],
  ['Renewables', colors[4]],
  ['Nuclear', colors[3]],
  ['Net electricity imports', getLighterColor(colors[0], 0.25)],
  ['Electric power', colors[0]],
  ['Electrical system losses', getLighterColor(colors[5], 0.4)],
])
export const nodeLabel = (d: NodeDatum): string => d.id
export const nodeColor = (d: NodeDatum): string => palette[d.id] ?? getLighterColor(colors[0], 0.4)
export const linkColor = (d: SankeyLink<NodeDatum, DataRecord>): string => nodeColor(d.source)
export const subLabel = (d: SankeyNode<NodeDatum, DataRecord>): string => `${d.value.toFixed(2)} quad`
export const tooltipTriggers = {
  [Sankey.selectors.link]: (d: SankeyLink<NodeDatum, DataRecord>): string =>
    `<b>${d.source.id} → ${d.target.id}</b><br/>${d.value.toFixed(3)} quadrillion Btu`,
  [Sankey.selectors.node]: (d: SankeyNode<NodeDatum, DataRecord>): string => `<b>${d.id}</b><br/>${d.value.toFixed(3)} quadrillion Btu`,
}
export function getView (
  state: ExampleState,
  update: UpdateState
): { data: { nodes: NodeDatum[]; links: DataRecord[] }; events: Record<string, Record<string, (d: NodeDatum) => void>>; summary: string } {
  const selected = data.filter(d => state.focus === 'all' || d.source === 'Electric power' || d.target === 'Electric power')
  const nodes = [...new Set(selected.flatMap(d => [d.source, d.target]))].map(id => ({ id }))
  const input = selected.filter(d => d.source !== 'Electric power').reduce((sum, d) => sum + d.value, 0)
  const losses = selected.find(d => d.target === 'Electrical system losses')?.value ?? 0
  return {
    data: { nodes, links: selected.map(d => ({ ...d })) },
    events: {
      [Sankey.selectors.node]: {
        click: (d): void => {
          if (d.id === 'Electric power') update({ focus: state.focus === 'all' ? 'electricity' : 'all' })
        },
      },
    },
    summary: `${input.toFixed(2)} quadrillion Btu entering this view · ${losses.toFixed(2)} quad of electrical system losses · click Electric power to focus or restore the full flow`,
  }
}
