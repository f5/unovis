import React, { useRef } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Basic Grouped Bar Chart'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <>
      <div>AutoMargin True</div>
      <VisXYContainer<XYDataRecord> ariaLabel='A simple example of a Grouped Bar chart' data={generateXYDataRecords(15)} xDomain={[-1, 15]}>
        <VisGroupedBar x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} />
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
        <VisTooltip ref={tooltipRef}/>
      </VisXYContainer>

      <div style={{ marginTop: 20 }}>AutoMargin False</div>
      <VisXYContainer<XYDataRecord> ariaLabel='A simple example of a Grouped Bar chart' data={generateXYDataRecords(15)} margin={{ top: 5, right: 10, left: 30, bottom: 40 }} xDomain={[-1, 15]} autoMargin={false}>
        <VisGroupedBar x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} position='left' numTicks={6} tickPadding={8} tickTextWidth={50} tickTextAngle={0} tickTextAlign='center' tickLine={false} gridLine={true} domainLine={true} />
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`}/>
        <VisTooltip ref={tooltipRef}/>
      </VisXYContainer>
    </>
  )
}
