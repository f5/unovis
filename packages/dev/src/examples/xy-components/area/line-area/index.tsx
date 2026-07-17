import React, { useRef, useState } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Line Area Chart'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const fullData = useRef(generateXYDataRecords(15)).current
  const [hasData, setHasData] = useState(true)

  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <div>
      <button onClick={() => setHasData(prev => !prev)} style={{ marginBottom: 8 }}>
        {hasData ? 'Clear data' : 'Restore data'}
      </button>
      <VisXYContainer<XYDataRecord> data={hasData ? fullData : []} margin={{ top: 5, left: 5 }}>
        <VisArea
          x={d => d.x}
          y={accessors}
          duration={props.duration}
          line={hasData}
          lineWidth={2}
          lineColor={['#1F5BC7', '#CB3B54', '#C48900']}
          lineDashArray={[4, 4]}
        />
        <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} duration={props.duration}/>
        <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} duration={props.duration}/>
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>
    </div>
  )
}
