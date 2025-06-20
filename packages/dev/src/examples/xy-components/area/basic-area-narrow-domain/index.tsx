import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair, VisLine } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Narrow Domain Area Chart'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (<>
    <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} margin={{ top: 5, left: 5 }} xDomain={[-0.2, 0.3]} scaleByDomain={true}>
      <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
    </VisXYContainer>
    <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} margin={{ top: 5, left: 5 }} xDomain={[1.5, 2.3]} scaleByDomain={true}>
      <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
    </VisXYContainer>
  </>
  )
}
