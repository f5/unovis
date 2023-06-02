import React from 'react'
import { Axis } from '@unovis/ts'
import { VisXYContainer, VisAxis } from '@unovis/react'


// Style
import s from './style.module.css'

export const title = 'Axis'
export const subTitle = 'Single axis with styling'
export const component = (): JSX.Element => {
  return (
    <VisXYContainer className={s.axis} xDomain={[0, 1000]} height={75}>
      <VisAxis
        type='x'
        numTicks={10}
        events={{
          [Axis.selectors.tickLabel]: {
            click: (tickValue: number) => alert(`Clicked tick: ${tickValue}`),
          },
        }}
      />
    </VisXYContainer>
  )
}
