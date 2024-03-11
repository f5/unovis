import React, { useRef } from 'react'
import { XYContainer, StackedBar, Axis } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'

export const title = 'Basic Stacked Bar Chart'
export const subTitle = 'Generated Data'
export const component = (): JSX.Element => {
  const tooltipRef = useRef(null)
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]
  const data = generateXYDataRecords(15),

  const tsChart = useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    console.log(tsChart)
    if (tsChart.current && tsChart.current.childElementCount === 0) {
      const c = new XYContainer(tsChart.current, {
        margin: { top: 5, left: 5 },
        components: [new StackedBar({ x: d => d.x, y: accessors })],
        xAxis: new Axis({ type: 'x', numTicks: 3, tickFormat: (x: number) => `${x}ms` }),
        yAxis: new Axis({ type: 'y', tickFormat: (y: number) => `${y}bps` }),
      }, data)
    }
  })

  return (
    <><div ref={tsChart}></div>
      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisStackedBar x={d => d.x} y={accessors} />
        <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} />
        <VisAxis type='y' tickFormat={(y: number) => `${y}bps`} />
        <VisCrosshair template={(d: XYDataRecord) => `${d.x}`} />
        <VisTooltip ref={tooltipRef} />
      </VisXYContainer></>
  )
}
