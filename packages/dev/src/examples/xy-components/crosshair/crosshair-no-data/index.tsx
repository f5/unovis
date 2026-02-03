import React, { useMemo, useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@/utils/data'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

export const title = 'Crosshair without Data'
export const subTitle = 'Warning emitted'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        ⚠️ The data passed only to the Area component: a warning into console will be emitted
      </div>
      <VisXYContainer<XYDataRecord> margin={{ top: 5, left: 5 }}>
        <VisArea data={generateXYDataRecords(50)} x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair x={d => d.x} yStacked={accessors} template={(d: XYDataRecord) => `${d?.x || 'no data'}`} />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>

      <div style={{ margin: '10px', fontSize: '14px', color: '#666' }}>
        ✅ The data passed to XY Container, which passes it to the Crosshair component
      </div>
      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(100)} margin={{ top: 5, left: 5 }}>
        <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair template={(d: XYDataRecord) => `${d?.x || 'no data'}`} />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>
    </>
  )
}
