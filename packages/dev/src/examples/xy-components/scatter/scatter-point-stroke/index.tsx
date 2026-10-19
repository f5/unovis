import React, { useMemo } from 'react'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'

import { generateXYDataRecords, XYDataRecord, randomNumberGenerator } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Points with stroke'
export const subTitle = 'Random stroke width and color'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = [
    (d: XYDataRecord) => d.y,
  ]

  const data = useMemo(() => generateXYDataRecords(65).map(d => ({ ...d, strokeWidth: 1 + 5 * randomNumberGenerator() })), [])
  const color = (d: XYDataRecord): string => d.x % 2 === 0 ? 'none' : '#F4B83E'
  const strokeColor = (d: XYDataRecord): string => d.x % 2 !== 0 ? '#FF6B7E' : '#4D8CFD'
  const size = (d: XYDataRecord): number => d.x % 2 === 0 ? 25 : 10
  const strokeWidth = (d: XYDataRecord & { strokeWidth: number }): number => d.strokeWidth
  return (
    <VisXYContainer<XYDataRecord & { strokeWidth: number }> data={data} margin={{ top: 5, left: 5 }}>
      <VisScatter x={d => d.x} y={accessors} size={size} color={color} strokeColor={strokeColor} strokeWidth={strokeWidth} duration={props.duration}/>
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration}/>
    </VisXYContainer>
  )
}
