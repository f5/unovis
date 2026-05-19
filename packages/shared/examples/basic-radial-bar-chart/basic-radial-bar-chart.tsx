import React, { useCallback } from 'react'
import { VisSingleContainer, VisRadialBar, VisRadialBarSelectors, VisTooltip, VisBulletLegend } from '@unovis/react'
import type { RadialBarArcDatum } from '@unovis/ts'

import { data, DataRecord, maxValue, completion } from './data'

const legendItems = data.map(d => ({ name: d.key }))

export default function BasicRadialBarChart (): React.ReactElement {
  return (
    <>
      <VisBulletLegend items={legendItems}/>
      <VisSingleContainer height={400}>
        <VisRadialBar<DataRecord>
          value={useCallback(d => d.value, [])}
          maxValue={maxValue}
          data={data}
          trackWidth={18}
          trackPadding={4}
          cornerRadius={9}
          centralLabel={`${completion}%`}
          centralSubLabel="daily goals"
        />
        <VisTooltip triggers={{
          [VisRadialBarSelectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
            const max = maxValue[d.index] ?? '—'
            return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
          },
        }}
        />
      </VisSingleContainer>
    </>
  )
}
