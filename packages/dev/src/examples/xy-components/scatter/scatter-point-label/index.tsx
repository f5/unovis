import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisScatter, VisXYContainer } from '@unovis/react'
import React from 'react'


export const title = 'Points with labels'
export const subTitle = 'Multi-accessor'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y2,
  ]

  const data = generateXYDataRecords(35)
  const size = (d: XYDataRecord): number => (d.x % 2 === 0 ? 25 : 10)
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisScatter x={d => d.x} y={accessors} size={size} label={(d, i) => `${accessors[i](d)?.toFixed(2)}`} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
    </VisXYContainer>
  )
}
