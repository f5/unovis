import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { TreemapNode } from 'packages/ts'

export const title = 'Treemap: Basic'
export const subTitle = 'Hierarchical data visualization with custom colors'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
}

export const component = (): JSX.Element => {
  const data: TreemapExampleDatum[] = [
    { name: 'A', value: 20, group: 'Group 1' },
    { name: 'B', value: 15, group: 'Group 1' },
    { name: 'C', value: 10, group: 'Group 2' },
    { name: 'D', value: 5, group: 'Group 2' },
    { name: 'E', value: 8, group: 'Group 3' },
    { name: 'F', value: 12, group: 'Group 3' },
  ]

  return (
    <VisSingleContainer height={400}>
      <VisTreemap
        data={data}
        value={(d: TreemapExampleDatum) => d.value}
        layers={[
          (d: TreemapExampleDatum) => d.group,
          (d: TreemapExampleDatum) => d.name,
        ]}
        tileLabel={(node: TreemapNode<TreemapExampleDatum>) => node.data.datum?.name}
        padding={24}
      />
    </VisSingleContainer>
  )
}
