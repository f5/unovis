import React, { useCallback } from 'react'
import { VisSingleContainer, VisCircularBar, VisCircularBarSelectors, VisTooltip, VisBulletLegend } from '@unovis/react'
import type { CircularBarArcDatum } from '@unovis/ts'

import { data, DataRecord, maxValue } from './data'
import './styles.css'

const legendItems = data.map(d => ({ name: d.key, color: d.color }))

export default function BasicCircularBarChart (): React.ReactElement {
  return (
    <div className='circular-bar-chart'>
      <VisBulletLegend items={legendItems}/>
      <VisSingleContainer height={400}>
        <VisCircularBar<DataRecord>
          value={useCallback(d => d.value, [])}
          color={useCallback(d => d.color, [])}
          icon={useCallback(d => d.icon, [])}
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
