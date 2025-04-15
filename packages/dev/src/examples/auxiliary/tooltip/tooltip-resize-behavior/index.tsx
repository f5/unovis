import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { XYDataRecord } from '@/utils/data'
import { VisAxis, VisScatter, VisTooltip, VisXYContainer } from '@unovis/react'
import { Position, Scatter } from '@unovis/ts'
import React from 'react'
import s from './styles.module.css'


export const title = 'Scrollable Container Comparison'
export const subTitle = 'For testing resize behavior'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [
    { x: 0, y: 5 },
    { x: 3, y: 10 },
    { x: 6, y: 0 },
    { x: 9, y: 5 },
  ]

  return (<>
    <VisXYContainer<XYDataRecord> data={data}>
      <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} duration={props.duration}/>
      <VisTooltip horizontalPlacement={Position.Center} triggers={{
        [Scatter.selectors.point]: () => `<div class="${s.tooltip}">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </div>`,
      }} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
    <div className={s.scrollContainer}>
      <VisXYContainer<XYDataRecord> data={data} width={800}>
        <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} duration={props.duration}/>
        <VisTooltip horizontalPlacement={Position.Center} triggers={{
          [Scatter.selectors.point]: (d) => `<div class="${s.tooltip}">${d.x}, ${d.y}</div>`,
        }} />
        <VisAxis type='x' duration={props.duration} />
        <VisAxis type='y' duration={props.duration} />
      </VisXYContainer>
    </div>
  </>
  )
}
