import { JSX } from 'solid-js'
import { VisBulletLegend, VisRadialBar, VisRadialBarSelectors, VisSingleContainer, VisTooltip } from '@unovis/solid'
import type { RadialBarArcDatum } from '@unovis/ts'

import { data, DataRecord, maxValue, completion } from './data'

const BasicRadialBarChart = (): JSX.Element => {
  const legendItems = data.map(d => ({ name: d.key }))

  return (
    <div>
      <VisBulletLegend items={legendItems} />
      <VisSingleContainer height='50dvh'>
        <VisRadialBar
          value={(d: DataRecord) => d.value}
          maxValue={maxValue}
          data={data}
          trackWidth={18}
          trackPadding={4}
          cornerRadius={9}
          centralLabel={`${completion}%`}
          centralSubLabel='daily goals'
        />
        <VisTooltip triggers={{
          [VisRadialBarSelectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
            const max = maxValue[d.index] ?? '—'
            return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
          },
        }}
        />
      </VisSingleContainer>
    </div>
  )
}

export default BasicRadialBarChart
