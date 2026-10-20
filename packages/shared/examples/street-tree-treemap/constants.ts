import { Treemap, TreemapNode, TreemapConfigInterface, colors } from '@unovis/ts'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'
export const svgDefs = `
<filter id="street-tree-muted" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values="0.65 0 0 0 0.35 0 0.65 0 0 0.35 0 0 0.65 0 0.35 0 0 0 1 0"/>
</filter>
`


export type ExampleState = { borough: string; query: string; selected: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { borough: 'All', query: '', selected: '' }
export const palette = colors.slice(0, 5)
export const tileLabelMediumFontSize = 10
export const tileLabelLargeFontSize = 14
export const tileSort = (a: TreemapNode<DataRecord>, b: TreemapNode<DataRecord>): number => (b.value ?? 0) - (a.value ?? 0)
export const boroughs = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island']
export const boroughOptions = [{ value: 'All', label: 'All boroughs' }, ...boroughs.map(value => ({ value, label: value }))]
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
export const compact = (value: number | Date): string => compactFormatter.format(+value)
export const value = (d: DataRecord): number => d.count
export const layers = [(d: DataRecord): string => d.borough, (d: DataRecord): string => d.species]
export const tooltipTriggers = {
  [Treemap.selectors.tile]: (node: TreemapNode<DataRecord>): string => {
    const datum = node.data.datum as DataRecord | undefined
    return datum
      ? `<b>${datum.species}</b><br/>${datum.borough} · ${datum.count.toLocaleString('en-US')} living trees`
      : (node.data.key ?? '')
  },
}
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: DataRecord[];
    summary: string;
    attributes: TreemapConfigInterface<DataRecord>['attributes'];
    events: Record<string, Record<string, (node: TreemapNode<DataRecord>) => void>>;
    tileColor: (node: TreemapNode<DataRecord>) => string | undefined;
  } {
  const selected = data.filter(
    d => (state.borough === 'All' || d.borough === state.borough) && d.species.toLowerCase().includes(state.query.toLowerCase())
  )
  const total = selected.reduce((sum, d) => sum + d.count, 0)
  const chosen = selected.filter(d => d.species === state.selected).reduce((sum, d) => sum + d.count, 0)
  return {
    data: selected,
    summary: `${total.toLocaleString('en-US')} living trees displayed · ${new Set(selected.map(d => d.species)).size} species${chosen ? ` · ${state.selected}: ${((100 * chosen) / total).toFixed(1)}% of displayed trees` : ' · click a species to select it'}`,
    attributes: {
      [Treemap.selectors.tile]: {
        filter: (node: TreemapNode<DataRecord>): string => {
          const datum = node.data.datum as DataRecord | undefined
          return state.selected && datum && datum.species !== state.selected ? 'url(#street-tree-muted)' : 'none'
        },
      },
    },
    events: {
      [Treemap.selectors.clickableTile]: {
        click: (node): void => {
          const datum = node.data.datum as DataRecord | undefined
          if (datum) update({ selected: state.selected === datum.species ? '' : datum.species })
        },
      },
    },
    tileColor: (node): string | undefined => {
      const datum = node.data.datum as DataRecord | undefined
      if (datum) return undefined
      const borough = node.data.key ?? ''
      const index = boroughs.indexOf(borough)
      return index >= 0 ? palette[index] : undefined
    },
  }
}
