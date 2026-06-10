import React, { useCallback } from 'react'
import { VisXYContainer, VisBoxplot, VisAxis } from '@unovis/react'

import { data, DataRecord } from './data'

export default function BasicBoxplot (): JSX.Element {
  return (
    <VisXYContainer height={'50vh'}>
      <VisBoxplot
        data={data}
        x={useCallback((d: DataRecord) => d.x, [])}
        median={useCallback((d: DataRecord) => d.median, [])}
        quartiles={useCallback((d: DataRecord) => d.quartiles, [])}
        whiskers={useCallback((d: DataRecord) => d.whiskers, [])}
      ></VisBoxplot>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
    </VisXYContainer>
  )
}
