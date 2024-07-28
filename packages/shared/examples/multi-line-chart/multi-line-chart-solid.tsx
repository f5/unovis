import { JSX } from 'solid-js'
import { Scale } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisLine, VisXYContainer } from '@unovis/solid'

import { data, labels, CityTemps } from './data'

const MutilLineChart = (): JSX.Element => {
  const x = (d: CityTemps) => +new Date(d.date)
  const y = [
    (d: CityTemps) => d.austin,
    (d: CityTemps) => d.ny,
    (d: CityTemps) => d.sf,
  ]
  const items = ['austin', 'ny', 'sf'].map((city) => ({ name: labels[city] }))
  const xScale = Scale.scaleTime()

  return (
    <div>
      <VisBulletLegend items={items} />
      <VisXYContainer data={data} height='50dvh' xScale={xScale}>
        <VisLine x={x} y={y} />
        <VisAxis
          type='x'
          label='Date'
          numTicks={6}
          tickFormat={(v) => Intl.DateTimeFormat().format(v)}
        />
        <VisAxis type='y' label='Temperature (°C)' numTicks={6} />
      </VisXYContainer>
    </div>
  )
}

export default MutilLineChart
