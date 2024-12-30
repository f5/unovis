import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Treemap: Basic'
export const subTitle = 'Simple hierarchical data visualization'

type TreemapExampleDatum = { name: string; value: number }


export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data: TreemapExampleDatum[] = [
    { name: 'A', value: 20 },
    { name: 'B', value: 15 },
    { name: 'C', value: 10 },
    { name: 'D', value: 5 },
  ]
  return (
    <VisSingleContainer height={400}>
      <VisTreemap
        value={(d: TreemapExampleDatum) => d.value}
        layers={[
          (d: TreemapExampleDatum) => d.name,
        ]}
        data={data}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
