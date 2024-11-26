import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Treemap: Basic'
export const subTitle = 'Simple hierarchical data visualization'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = [
    { name: 'A', value: 20 },
    { name: 'B', value: 15 },
    { name: 'C', value: 10 },
    { name: 'D', value: 5 },
  ]

  return (
    <VisSingleContainer height={400}>
      <VisTreemap
        value={d => d.value}
        data={data}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
