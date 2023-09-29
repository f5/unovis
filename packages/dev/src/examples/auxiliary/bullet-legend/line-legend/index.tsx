import React from 'react'
import { VisBulletLegend, VisXYContainer, VisLine, VisAxis } from '@unovis/react'
import { generateStackedDataRecords, StackedDataRecord } from '@src/utils/data'

import s from './styles.module.css'

export const title = 'Line Legend'
export const subTitle = 'with markers and dashes'

const data = generateStackedDataRecords(10)
const legendItems = Array(data[0].ys.length).fill(0).map((_, i) => ({ name: `Y${i}` }))

export const component = (): JSX.Element => {
  const svgDefs = `
    <marker id="circle-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
      <circle cx="5" cy="5" r="4" stroke-width="1" stroke="var(--vis-color2)" fill="#fff"/>
    </marker>
    <marker id="square-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
      <polygon points="5,0 10,5 5,10 0,5" stroke="none" fill="var(--vis-color4)"/>
    </marker>
    <marker id="arrow-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vis-color5)"/>
    </marker>
  `
  return (
    <div className={s.legends}>
      <VisBulletLegend bulletShape='line' bulletSize='12px' items={legendItems}/>
      <VisXYContainer data={data} svgDefs={svgDefs}>
        <VisLine
          x={(d: StackedDataRecord) => d.x}
          y={legendItems.map((_, i) => (d: StackedDataRecord) => d.ys[i])}
        />
        <VisAxis type='x'/>
        <VisAxis type='y'/>
      </VisXYContainer>
    </div>
  )
}
