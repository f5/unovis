import React, { useEffect, useRef } from 'react'
import { Area, Axis, XYContainer } from '@unovis/ts'

import { XYDataRecord } from '@src/utils/data'

export const accessors = [
  (d: XYDataRecord): number => d.y,
  (d: XYDataRecord): number | undefined => d.y1,
  (d: XYDataRecord): number | undefined => d.y2,
]

export function TsAreaChart (props: { data: XYDataRecord[]; duration: number | undefined }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chart = new XYContainer<XYDataRecord>(ref.current as HTMLDivElement, {
      height: 200,
      components: [new Area<XYDataRecord>({ x: d => d.x, y: accessors, duration: props.duration })],
      xAxis: new Axis({ duration: props.duration }),
      yAxis: new Axis({ duration: props.duration }),
    }, props.data)

    return () => chart.destroy()
  }, [props.data, props.duration])

  return <div ref={ref}/>
}
