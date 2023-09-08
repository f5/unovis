import React from 'react'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'

import { random } from '@src/utils/random'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'

export const title = 'Points with stroke'
export const subTitle = 'Random stroke width and color'
export const component = (): JSX.Element => {
  const accessors = [
    (d: XYDataRecord) => d.y,
  ]

  const data = generateXYDataRecords(65)
  const color = (d: XYDataRecord): string => d.x % 2 === 0 ? 'none' : '#F4B83E'
  const strokeColor = (d: XYDataRecord): string => d.x % 2 !== 0 ? '#FF6B7E' : '#4D8CFD'
  const size = (d: XYDataRecord): number => d.x % 2 === 0 ? 25 : 10
  const strokeWidth = (): number => 1 + 5 * random.float()
  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
      <VisScatter x={d => d.x} y={accessors} size={size} color={color} strokeColor={strokeColor} strokeWidth={strokeWidth} />
      <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`}/>
      <VisAxis type='y' tickFormat={(y: number) => `${y}`}/>
    </VisXYContainer>
  )
}
