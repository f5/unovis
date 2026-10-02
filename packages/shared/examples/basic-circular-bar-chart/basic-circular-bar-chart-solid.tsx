import { JSX } from 'solid-js'
import { VisBulletLegend, VisCircularBar, VisCircularBarSelectors, VisSingleContainer, VisTooltip } from '@unovis/solid'
import type { CircularBarArcDatum } from '@unovis/ts'

import { data, DataRecord, maxValue } from './data'
import './styles.css'

const BasicCircularBarChart = (): JSX.Element => {
  const legendItems = data.map(d => ({ name: d.key, color: d.color }))

  return (
    <div class='circular-bar-chart'>
      <VisBulletLegend items={legendItems} />
      <VisSingleContainer height='50dvh'>
        <VisCircularBar
          value={(d: DataRecord) => d.value}
          color={(d: DataRecord) => d.color}
          icon={(d: DataRecord) => d.icon}
          maxValue={maxValue}
          data={data}
        />
        <VisTooltip triggers={{
          [VisCircularBarSelectors.bar]: (d: CircularBarArcDatum<DataRecord>) => {
            const max = maxValue[d.index] ?? '—'
            return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
          },
        }}
        />
      </VisSingleContainer>
    </div>
  )
}

export default BasicCircularBarChart
