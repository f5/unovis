import { createMemo, createSignal, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisLine, VisXYContainer, VisXYLabels } from '@unovis/solid'

import './styles.css'

import { countries, data, legendItems, Country, DataRecord } from './data'

const DataGapLineChart = (): JSX.Element => {
  function getY (c: Country): (d: DataRecord) => number {
    return (d: DataRecord) => d[c.id]
  }

  const x = (d: DataRecord): number => d.year
  const y = countries.map(getY)
  const labelConfig = {
    data: countries,
    x: 2019.5,
    y: (c: Country) => getY(c)(data[data.length - 1]),
    label: (c: Country) => c.label,
  }

  const [curr, setCurr] = createSignal(0)
  const fallbackValue = createMemo(() => legendItems[curr()].value)
  const items = createMemo(() =>
    legendItems.map((o, i) => ({
      name: o.name,
      inactive: curr() !== i,
      color: countries[0].color,
    }))
  )

  function onLegendItemClick (_, i: number): void {
    setCurr(i)
  }

  return (
    <div>
      <div class='fallbackValueSwitch'>
        Select a fallback value for missing data points:
        <VisBulletLegend
          items={items()}
          onLegendItemClick={onLegendItemClick}
        />
      </div>
      <VisXYContainer
        duration={0}
        height='50dvh'
        xDomain={[1961, 2022]}
        yDomain={[0, 650]}
      >
        <VisLine data={data} x={x} y={y} fallbackValue={fallbackValue()} />
        <VisXYLabels backgroundColor='none' {...labelConfig} />
        <VisAxis type='x' numTicks={10} />
        <VisAxis
          type='y'
          label='National Cereal Production, tons'
          tickFormat={(d) => `${d}${d ? 'M' : ''}`}
          tickValues={[0, 200, 400, fallbackValue(), 600]}
        />
      </VisXYContainer>
    </div>
  )
}

export default DataGapLineChart
