import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisScatter, VisXYContainer } from '@unovis/react'
import React from 'react'


export const title = 'Points with stroke'
export const subTitle = 'Random stroke width and color'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = [
    (d: XYDataRecord) => d.y,
  ]

  const data = generateXYDataRecords(65)
  const color = (d: XYDataRecord): string => d.x % 2 === 0 ? 'none' : '#F4B83E'
  const strokeColor = (d: XYDataRecord): string => d.x % 2 !== 0 ? '#FF6B7E' : '#4D8CFD'
  const size = (d: XYDataRecord): number => d.x % 2 === 0 ? 25 : 10
  const strokeWidth = (): number => 1 + 5 * Math.random()
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisScatter x={d => d.x} y={accessors} size={size} color={color} strokeColor={strokeColor} strokeWidth={strokeWidth} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
    </VisXYContainer>
  )
}
