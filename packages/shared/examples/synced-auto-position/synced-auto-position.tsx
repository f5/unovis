import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/react'
import { LabelOverflow } from '@unovis/ts'
import React from 'react'
import { data, thresholds, DataRecord } from './data'

const margin = { top: 10, right: 200, bottom: 30, left: 40 }

export default function SyncedAutoPosition (): JSX.Element {
  return (
    <VisXYContainer data={data} height={400} margin={margin} yDomain={[5.0, 7.0]}>
      <VisLine<DataRecord> x={d => d.x} y={d => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      {thresholds.map(t => (
        <VisPlotline
          key={t.value}
          value={t.value}
          labelText={t.label}
          labelPosition='top-right'
          labelAutoPosition={true}
          labelOverflow={LabelOverflow.Smart}
          color='#666'
          lineStyle='dash'
        />
      ))}
    </VisXYContainer>
  )
}
