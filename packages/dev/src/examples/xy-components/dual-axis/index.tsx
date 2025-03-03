import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Dual Axis Chart'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const margin = { left: 100, right: 100, top: 40, bottom: 60 }
  const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '40vh' }
  return (<>
    <VisXYContainer
      data={generateXYDataRecords(150)}
      margin={margin}
      autoMargin={false}
      style={style}
    >
      <VisArea<XYDataRecord> x={d => d.x} y={(d: XYDataRecord, i: number) => i * (d.y || 0)} opacity={0.9} color='#FF6B7E' duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} label='Time' duration={props.duration}/>
      <VisAxis type='y'
        tickFormat={(y: number) => `${y}bps`}
        tickTextWidth={60}
        tickTextColor='#FF6B7E'
        labelColor='#FF6B7E'
        label='Traffic'
        duration={props.duration}
      />
    </VisXYContainer>
    <VisXYContainer
      data={generateXYDataRecords(150)}
      yDomain={[0, 150]}
      margin={margin}
      autoMargin={false}
      style={style}
    >
      <VisLine<XYDataRecord> x={d => d.x} y={d => 20 + 10 * (d.y2 || 0)} duration={props.duration}/>
      <VisAxis
        type='y'
        position={'right'}
        tickFormat={(y: number) => `${y}db`}
        gridLine={false}
        tickTextColor='#4D8CFD'
        labelColor='#4D8CFD'
        label='Signal Strength'
        duration={props.duration}
      />
    </VisXYContainer>
  </>
  )
}
