import React from 'react'
import { VisSingleContainer, VisRadialBar } from '@unovis/react'
import { GeneratedComponent } from '@src/examples'

export const transitionComponent: GeneratedComponent<number[]> = {
  data: (): number[] => Array(4).fill(0).map(() => Math.random()),
  dataSeries: {
    noData: () => [],
    singleDataElement: (data: number[]) => [data[0]],
  },
  component: (props) => (
    <VisSingleContainer data={props.data}>
      <VisRadialBar value={d => d} duration={props.duration ?? 800}/>
    </VisSingleContainer>
  ),
}
