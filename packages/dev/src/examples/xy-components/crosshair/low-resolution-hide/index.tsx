import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Hide when low resolution'
export const subTitle = 'Comparing hideWhenFarFromPointer behavior'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateXYDataRecords(3) // Only 10 data records
  const accessors = [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div>
          <b style={{ fontFamily: 'monospace' }}>hideWhenFarFromPointer: true (default)</b>
          <div>Will hide when the mouse position is far from the nearest data point</div>
        </div>
        <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
          <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
          <VisTooltip ref={tooltipRef} container={document.body}/>
        </VisXYContainer>
      </div>

      {/* Second chart with hideWhenFarFromPointer set to false */}
      <div>
        <div>
          <b style={{ fontFamily: 'monospace' }}>hideWhenFarFromPointer: false</b>
          <div>Will not hide</div>
        </div>
        <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
          <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair
            template={(d: XYDataRecord) => `${d.x}`}
            hideWhenFarFromPointer={false}
          />
          <VisTooltip ref={tooltipRef} container={document.body}/>
        </VisXYContainer>
      </div>
    </div>
  )
}
