import React from 'react'
import { sum } from 'd3-array'
import { VisBulletLegend, VisSingleContainer, VisDonut, VisXYContainer, VisStackedBar } from '@unovis/react'

import s from './styles.module.css'

export const title = 'Basic Bullet Legend'
export const subTitle = 'with Stacked Bar and Donut'

type DataRecord = {
  x: number;
  ys: number[];
}

export const component = (): JSX.Element => {
  const items = Array(6).fill(0).map((_, i) => ({ name: `y${i}` }))
  const data = Array(10).fill(0).map((_, i) => ({
    x: i,
    ys: items.map(() => Math.random()),
  }))
  const accessors = items.map((_, i) => (d: DataRecord) => d.ys[i])

  return (
    <div className={s.legendExample}>
      <VisBulletLegend items={items} bulletSize='20px'/>
      <div className={s.components}>
        <VisSingleContainer width={300}>
          <VisDonut data={items} value={(_, i) => sum(data.map(accessors[i]))} centralLabel='Total'/>
        </VisSingleContainer>
        <VisXYContainer>
          <VisStackedBar
            data={data}
            x={d => d.x}
            y={accessors}
          />
        </VisXYContainer>
      </div>
    </div>
  )
}
