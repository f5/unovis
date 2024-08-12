import React, { useCallback } from 'react'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Point Sizes'
export const subTitle = 'Varied sizeRange comparison'

const data = generateXYDataRecords(100)

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
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
