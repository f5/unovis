import React from 'react'
import { VisSingleContainer, VisCircularBar } from '@unovis/react'
import { GeneratedComponent } from '@src/examples'
import { getCircularBarColor } from './palette'

export const transitionComponent: GeneratedComponent<number[]> = {
  data: (): number[] => Array(7).fill(0).map(() => Math.random()),
  dataSeries: {
    noData: () => [],
    singleDataElement: (data: number[]) => [data[0]],
  },
  component: (props) => (
    <VisSingleContainer data={props.data}>
      <VisCircularBar value={d => d} maxValue={1} color={getCircularBarColor} duration={props.duration ?? 800}/>
    </VisSingleContainer>
  ),
}
