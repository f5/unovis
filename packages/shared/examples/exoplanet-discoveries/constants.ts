import { NestedDonut, NestedDonutSegment, BulletLegendItemInterface, colors, getLighterColor } from '@unovis/ts'
import { data, DataRecord } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { era: string; method: string; facility: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { era: 'all', method: '', facility: '' }
export const eraOptions = [
  { value: 'all', label: 'All discoveries through 2024' },
  { value: 'early', label: 'Before 2010' },
  { value: 'recent', label: '2010–2024' },
]
export const methods = [...new Set(data.map(d => d.method))].sort((a, b) =>
  data.filter(d => d.method === b).reduce((sum, d) => sum + d.count, 0) - data.filter(d => d.method === a).reduce((sum, d) => sum + d.count, 0)
)
export const palette = [...colors, ...colors.map(color => getLighterColor(color, 0.25))]
export const layerSettings = { width: 78 }
export const value = (d: DataRecord): number => d.count
export const method = (d: DataRecord): string => d.method
export const facility = (d: DataRecord): string => d.facility
export const year = (d: DataRecord): string => String(d.year)
export const sort = (a: NestedDonutSegment<DataRecord>, b: NestedDonutSegment<DataRecord>): number => (b.value ?? 0) - (a.value ?? 0)
export const tooltipTriggers = {
  [NestedDonut.selectors.segment]: (d: NestedDonutSegment<DataRecord>): string =>
    `<b>${d.data.key}</b><br/>${(d.value ?? 0).toLocaleString('en-US')} confirmed planets`,
}
export function getView (
  state: ExampleState,
  update: UpdateState
): {
    data: DataRecord[];
    segmentColor: (d: NestedDonutSegment<DataRecord>) => string | undefined;
    layers: ((d: DataRecord) => string)[];
    centralLabel: string;
    centralSubLabel: string;
    legend: BulletLegendItemInterface[];
    events: Record<string, Record<string, (d: NestedDonutSegment<DataRecord>) => void>>;
    summary: string;
  } {
  const selected = data.filter(
    d =>
      (state.era === 'all' || (state.era === 'early' ? d.year < 2010 : d.year >= 2010)) &&
      (!state.method || d.method === state.method) &&
      (!state.facility || d.facility === state.facility)
  )
  const count = selected.reduce((sum, d) => sum + d.count, 0)
  return {
    data: selected,
    segmentColor: (d): string | undefined =>
      palette[methods.indexOf(state.method || d.data.root || d.data.values[0]?.method) % palette.length],
    layers: state.facility ? [year] : state.method ? [facility, year] : [method, facility],
    centralLabel: count.toLocaleString('en-US'),
    centralSubLabel: state.facility || state.method || 'confirmed planets',
    legend: methods
      .filter(name => selected.some(d => d.method === name))
      .map(name => ({ name, color: palette[methods.indexOf(name) % palette.length] })),
    events: {
      [NestedDonut.selectors.segment]: {
        click: (segment): void => {
          const datum = segment.data.values[0]
          if (!datum) return
          if (!state.method) update({ method: datum.method, facility: '' })
          else if (!state.facility) update({ facility: datum.facility })
          else update({ method: '', facility: '' })
        },
      },
    },
    summary: `${state.method ? `All methods → ${state.method}` : 'All discovery methods'}${state.facility ? ` → ${state.facility}` : ''} · ${count.toLocaleString('en-US')} confirmed planets`,
  }
}
