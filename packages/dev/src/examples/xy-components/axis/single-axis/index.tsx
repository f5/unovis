import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { VisAxis, VisXYContainer } from '@unovis/react'
import { Axis } from '@unovis/ts'
import React from 'react'
// Style
import s from './style.module.css'


export const title = 'Axis'
export const subTitle = 'Single axis with styling'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <VisXYContainer className={s.axis} xDomain={[0, 1000]} height={75}>
      <VisAxis
        type='x'
        numTicks={10}
        duration={props.duration}
        events={{
          [Axis.selectors.tickLabel]: {
            click: (tickValue: number) => alert(`Clicked tick: ${tickValue}`),
          },
        }}
      />
    </VisXYContainer>
  )
}
