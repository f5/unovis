import { JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisGroupedBar, VisXYContainer } from '@unovis/solid'

import { data, capitalize, colors } from './data'

const BasicGroupBar = (): JSX.Element => {
  const items = Object.entries(colors).map(([n, c]) => ({
    name: capitalize(n),
    color: c,
  }))
  const x = (d: ElectionDatum) => d.year
  const y = [
    (d: ElectionDatum) => d.republican,
    (d: ElectionDatum) => d.democrat,
    (d: ElectionDatum) => d.other,
    (d: ElectionDatum) => d.libertarian,
  ]
  const color = (_: ElectionDatum, i: number) => items[i].color

  return (
    <div>
      <h2>U.S. Election Popular Vote Results by Political Party</h2>
      <VisBulletLegend items={items} />
      <VisXYContainer height='50dvh'>
        <VisGroupedBar data={data} x={x} y={y} color={color} />
        <VisAxis type='x' label='Election Year' numTicks={data.length} />
        <VisAxis
          type='y'
          label='Number of Votes (millions)'
          tickFormat={(d: number) => (d / 10 ** 6).toFixed(1)}
        />
      </VisXYContainer>
    </div>
  )
}

export default BasicGroupBar
