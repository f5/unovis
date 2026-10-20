import { ChordDiagram, ChordNode, ChordLinkDatum, ChordRibbon, colors, getLighterColor } from '@unovis/ts'
import { data, DataRecord } from './data'
export { ChordLabelAlignment } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { selected: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type NodeDatum = { id: string }
export const initialState: ExampleState = { selected: '' }
export const stateNames = ['CA', 'TX', 'FL', 'NY', 'WA', 'AZ', 'NC', 'GA', 'Other states']
export const fullNames = [
  'California',
  'Texas',
  'Florida',
  'New York',
  'Washington',
  'Arizona',
  'North Carolina',
  'Georgia',
  'Other states + DC',
]
export const stateOptions = [{ value: '', label: 'All connections' }, ...stateNames.map((value, i) => ({ value, label: fullNames[i] }))]
export const palette = [...colors, ...colors.map(color => getLighterColor(color, 0.25))]
export const nodeLabel = (d: { id?: string; key?: string }): string => d.id ?? d.key ?? ''
export const nodeColor = (d: { id?: string; key?: string }): string => palette[stateNames.indexOf(d.id ?? d.key ?? '')]
export const linkColor = (d: ChordLinkDatum<NodeDatum, DataRecord>): string => palette[stateNames.indexOf(d.source.id)]
export const tooltipTriggers = {
  [ChordDiagram.selectors.link]: (d: ChordRibbon<NodeDatum, DataRecord>): string =>
    `<b>${d.source.data.id} → ${d.target.data.id}</b><br/>${d.data.value.toLocaleString('en-US')} estimated movers`,
}
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: { nodes: NodeDatum[]; links: DataRecord[] };
    highlightedNodeId: string | undefined;
    highlightedLinkIds: number[] | undefined;
    events: Record<string, Record<string, (node: ChordNode<NodeDatum>) => void>>;
    summary: string;
  } {
  return {
    data: { nodes: stateNames.map(id => ({ id })), links: data.map(d => ({ ...d })) },
    highlightedNodeId: state.selected || undefined,
    highlightedLinkIds: state.selected
      ? data.flatMap((d, i) => (d.source === state.selected || d.target === state.selected ? [i] : []))
      : undefined,
    events: {
      [ChordDiagram.selectors.node]: {
        click: (node): void => update({ selected: state.selected === nodeLabel(node.data) ? '' : nodeLabel(node.data) }),
      },
    },
    summary: `${data.reduce((sum, d) => sum + d.value, 0).toLocaleString('en-US')} estimated moves between displayed groups · ${state.selected ? `${state.selected} highlighted` : 'hover a ribbon to read origin → destination'}`,
  }
}
