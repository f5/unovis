import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateXYDataRecords, XYDataRecord } from '@/utils/data'
import { VisAxis, VisScatter, VisXYContainer } from '@unovis/react'
import React, { useCallback } from 'react'

export const title = 'Point Sizes'
export const subTitle = 'Varied sizeRange comparison'

const data = generateXYDataRecords(100)

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const scatterProps = {
    x: useCallback((d: XYDataRecord) => d.x, []),
    y: useCallback((d: XYDataRecord) => d.y, []),
    size: useCallback((d: XYDataRecord) => d.x, []),
  }

  const sizeRanges: ([number, number] | undefined)[] = [
    [2, 10],
    [4, 32],
    [12, 50],
  ]

  return (
    <>
      {sizeRanges.map((s, i) => (
        <VisXYContainer key={`s${i}`} data={data}>
          <VisScatter {...scatterProps} sizeRange={s} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      ))}
    </>
  )
}
