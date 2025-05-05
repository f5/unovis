import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/react'
import React, { useCallback } from 'react'
import { data } from './data'


export default function BasicPlotlineChart (): JSX.Element {
  return (
    <VisXYContainer height={'50vh'}>
      <VisLine
        data={data}
        x={useCallback(d => d.x, [])}
        y={useCallback(d => d.y, [])}
      ></VisLine>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
      <VisPlotline value={1} color="red"></VisPlotline>
    </VisXYContainer>
  )
}
