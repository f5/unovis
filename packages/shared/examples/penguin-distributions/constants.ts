import { quantile } from 'd3-array'
import { Scatter } from '@unovis/ts'
import { data } from './data'

export const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
export const tooltipClassName = 'gallery-example-tooltip'


export type ExampleState = { sex: string }
export type UpdateState = (patch: Partial<ExampleState>) => void
export type Point = { species: string; sex: string; mass: number; x: number }
export type Box = { species: string; x: number; median: number; quartiles: [number, number]; whiskers: [number, number] }
export const initialState: ExampleState = { sex: 'All' }
export const sexOptions = ['All', 'Male', 'Female'].map(value => ({ value, label: value }))
export const species = ['Adelie', 'Chinstrap', 'Gentoo']
export const speciesTicks = [0, 1, 2]
export const legend = species.map((name, i) => ({ name, color: `var(--vis-color${i})` }))
export const speciesLabel = (value: number | Date): string => species[+value] ?? ''
export const pointX = (d: Point): number => d.x
export const pointY = (d: Point): number => d.mass
export const pointColor = (d: Point): string => `var(--vis-color${species.indexOf(d.species)})`
export const boxX = (d: Box): number => d.x
export const median = (d: Box): number => d.median
export const quartiles = (d: Box): [number, number] => d.quartiles
export const whiskers = (d: Box): [number, number] => d.whiskers
export const boxColor = (d: Box): string => `var(--vis-color${species.indexOf(d.species)})`
export const tooltipTriggers = {
  [Scatter.selectors.point]: (d: Point): string => `<b>${d.species}</b><br/>${d.sex} · ${d.mass.toLocaleString('en-US')} g`,
}
export function getView (state: ExampleState): { points: Point[]; boxes: Box[]; summary: string } {
  const points = data.flatMap((d, i): Point[] => {
    if (d.bodyMass == null || (state.sex !== 'All' && d.sex !== state.sex)) return []
    return [
      { species: d.species, sex: d.sex ?? 'Unknown', mass: d.bodyMass, x: species.indexOf(d.species) + Math.sin((i + 1) * 127.1) * 0.23 },
    ]
  })
  const boxes = species.flatMap((name, x): Box[] => {
    const values = points
      .filter(d => d.species === name)
      .map(d => d.mass)
      .sort((a, b) => a - b)
    const q1 = quantile(values, 0.25)
    const q3 = quantile(values, 0.75)
    const median = quantile(values, 0.5)
    if (q1 == null || q3 == null || median == null) return []
    const iqr = q3 - q1
    return [
      {
        species: name,
        x,
        median,
        quartiles: [q1, q3],
        whiskers: [
          values.find(v => v >= q1 - 1.5 * iqr) ?? values[0],
          [...values].reverse().find(v => v <= q3 + 1.5 * iqr) ?? values[values.length - 1],
        ],
      },
    ]
  })
  return {
    points,
    boxes,
    summary: `${points.length} measured penguins · ${state.sex === 'All' ? 'all recorded sexes, including unknown' : state.sex.toLowerCase()}`,
  }
}
