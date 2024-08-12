import React, { useEffect, useMemo, useState } from 'react'
import { D3BrushEvent } from 'd3-brush'
import { VisXYContainer, VisArea, VisAxis, VisBrush } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Style
import s from './style.module.css'

export const title = 'Custom Style Brush'
export const subTitle = 'Programmatically set selection range'
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<[number, number] | undefined>(undefined)

  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  const data = useMemo(() => generateXYDataRecords(25), [])
  useEffect(() => {
    setTimeout(() => {
      setSelectedRange([data[0].x, data[10].x])
    }, 1000)
  }, [])

  const onBrushMove = (
    range: [number, number] | undefined,
    e: D3BrushEvent<XYDataRecord>,
    userDriven: boolean
  ): void => {
    if (userDriven) setSelectedRange(range)
  }
  return (
    <VisXYContainer<XYDataRecord> className={s.brush} data={data} height={125} duration={0}>
      <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' numTicks={3} tickFormat={(x: number | Date) => `${x}ms`} duration={props.duration}/>
      <VisBrush onBrushMove={onBrushMove} draggable={true} selection={selectedRange} duration={props.duration}/>
    </VisXYContainer>
  )
}
