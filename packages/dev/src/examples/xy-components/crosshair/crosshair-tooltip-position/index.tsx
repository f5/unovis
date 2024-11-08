import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'
import { Position } from '@unovis/ts'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Custom Tooltip Placement'
export const subTitle = 'Tooltip always on the right'
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
  ]

  return (
    <VisXYContainer<XYDataRecord> data={generateXYDataRecords(20)} margin={{ top: 5, left: 5 }}>
      <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
      <VisTooltip ref={tooltipRef} container={document.body} horizontalPlacement={Position.Right}/>
    </VisXYContainer>
  )
}
