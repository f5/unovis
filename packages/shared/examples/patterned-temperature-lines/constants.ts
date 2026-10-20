import { LinePatternType, BulletLegendItemInterface } from '@unovis/ts'
import { data as dailyData, labels, CityTemps } from './data'
export { CurveType } from '@unovis/ts'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export const data: CityTemps[] = Array.from({ length: Math.ceil(dailyData.length / 7) }, (_, i) => {
  const week = dailyData.slice(i * 7, (i + 1) * 7)
  const mean = (city: 'austin' | 'ny' | 'sf'): number | null => {
    const values = week.flatMap(d => (d[city] === null ? [] : [d[city] as number]))
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }
  return { date: week[0].date, austin: mean('austin'), ny: mean('ny'), sf: mean('sf') }
})
export type ExampleState = { mode: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export const initialState: ExampleState = { mode: 'monochrome' }
export const modeOptions = [
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'color', label: 'Color + patterns' },
]
export const cities = ['austin', 'ny', 'sf'] as const
export const patterns = [LinePatternType.Triangle, LinePatternType.Diamond, LinePatternType.Square]
export const accessors = cities.map(
  city =>
    (d: CityTemps): number | undefined =>
      d[city] ?? undefined
)
export const pattern = (_data: CityTemps[], i: number): LinePatternType => patterns[i]
export const time = (d: CityTemps): number => Date.parse(`${d.date}T00:00:00Z`)
export const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format
export const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format
export const crosshairTemplate = (d: CityTemps): string =>
  `<b>${dateLabel(time(d))}</b><br/>${cities.map(city => `${labels[city]}: ${d[city]?.toFixed(1) ?? 'Missing'} °C`).join('<br/>')}`
export function getView (state: ExampleState): { colors: string[]; legend: BulletLegendItemInterface[]; summary: string } {
  const colors = cities.map((_, i) => (state.mode === 'monochrome' ? 'var(--gallery-ink)' : `var(--vis-color${i})`))
  return {
    colors,
    legend: cities.map((city, i) => ({ name: labels[city], color: colors[i], shape: 'line', pattern: patterns[i] })),
    summary: 'Austin: triangles · New York: diamonds · San Francisco: squares · hover to compare temperatures on the same date',
  }
}
