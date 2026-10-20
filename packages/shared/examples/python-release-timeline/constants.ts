import { Timeline, FillPatternType, PlotlineLabelPosition } from '@unovis/ts'
import { data, DataRecord } from './data'
export { PlotlineLabelPosition } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { status: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type Segment = DataRecord & { segmentStart: number; segmentEnd: number; planned: boolean; id: string }
export const snapshot = Date.UTC(2026, 9, 19)
export const domain: [number, number] = [Date.UTC(2018, 0, 1), Date.UTC(2032, 0, 1)]
export const initialState: ExampleState = { status: 'all' }
export const statusOptions = [
  { value: 'all', label: 'All releases' },
  { value: 'supported', label: 'Supported releases' },
  { value: 'end-of-life', label: 'End of life' },
]
export const legend = [
  { name: 'Bugfix support', color: 'var(--vis-color0)' },
  { name: 'Security support', color: 'var(--vis-color1)' },
  { name: 'End of life', color: '#8f9fb6' },
]
export const id = (d: Segment): string => d.id
export const start = (d: Segment): number => d.segmentStart
export const duration = (d: Segment): number => d.segmentEnd - d.segmentStart
export const row = (d: Segment): string => `Python ${d.version}`
export const color = (d: Segment): string =>
  d.status === 'end-of-life' ? '#8f9fb6' : d.status === 'security' ? 'var(--vis-color1)' : 'var(--vis-color0)'
export const pattern = (d: Segment): FillPatternType | undefined => (d.planned ? FillPatternType.StripesDiagonal : undefined)
export const yearLabel = (value: number | Date): string => String(new Date(+value).getUTCFullYear())
export const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format
export const tooltipTriggers = {
  [Timeline.selectors.line]: (d: Segment): string =>
    `<b>Python ${d.version}</b><br/>Current status: ${d.status}<br/>First release: ${dateLabel(d.start)}<br/>${d.scheduled ? 'Scheduled' : 'Completed'} end of support: ${dateLabel(d.end)}<br/>Release manager: ${d.releaseManager}`,
}
export function getView (state: ExampleState): { data: Segment[]; summary: string; labelPosition: PlotlineLabelPosition } {
  const releases = data.filter(
    d => state.status === 'all' || (state.status === 'supported' ? d.status !== 'end-of-life' : d.status === state.status)
  )
  const segments = releases.flatMap((d): Segment[] => {
    const elapsed: Segment = {
      ...d,
      id: `${d.version}-elapsed`,
      planned: false,
      segmentStart: d.start,
      segmentEnd: Math.min(d.end, snapshot),
    }
    return d.end > snapshot
      ? [elapsed, { ...d, id: `${d.version}-planned`, planned: true, segmentStart: snapshot, segmentEnd: d.end }]
      : [elapsed]
  })
  return {
    data: segments,
    labelPosition: state.status === 'end-of-life' ? PlotlineLabelPosition.TopRight : PlotlineLabelPosition.TopLeft,
    summary: `${releases.length} release lifecycles · color indicates status at the snapshot · striped segments indicate scheduled future support`,
  }
}
