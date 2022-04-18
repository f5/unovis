import React from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@volterra/vis-react'

import { data } from './data'

export default function BasicLineChart (): JSX.Element {
  return (
    <VisXYContainer>
      <VisLine data={data} x={d => d.x} y={d => d.y}></VisLine>
      <VisAxis type="x"></VisAxis>
      <VisAxis type="y"></VisAxis>
    </VisXYContainer>
  )
}
