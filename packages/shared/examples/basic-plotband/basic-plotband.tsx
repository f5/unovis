import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/react'
import React from 'react'
import { data } from './data'


export default function BasicPlotlineChart (): JSX.Element {
  return (
    <VisXYContainer height={600}>
      <VisLine data={data} x={d => d.x} y={d => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      <VisPlotband from={3} to={5} labelText='Plot Band' />
    </VisXYContainer>
  )
}
