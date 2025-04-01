import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisCrosshair, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/react'
import React, { useRef } from 'react'


export const title = 'Stacked Bar: Negative Values'
export const subTitle = 'Positive and Negative Stack'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateXYDataRecords(15)
  const accessors = [
    (d: XYDataRecord) => (d.y1 || 0) - 3,
    (d: XYDataRecord, i: number) => i % 4 ? d.y : -d.y,
    (d: XYDataRecord, i: number) => i % 2 ? d.y1 : -(d.y1 as number),
  ]

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisStackedBar x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
      <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
      <VisTooltip ref={tooltipRef} />
    </VisXYContainer>
  )
}
