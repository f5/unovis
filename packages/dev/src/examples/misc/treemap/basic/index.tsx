import React from 'react'
import { VisSingleContainer, VisTreemap } from '@unovis/react'
import { TreemapNode } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Treemap: Basic'
export const subTitle = 'Hierarchical data visualization with custom colors'

type TreemapExampleDatum = {
  name: string;
  value: number;
  group?: string;
}

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
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
        tileColor={(node: TreemapNode<TreemapExampleDatum>) => {
          const group = node.data.datum?.group || ''
          switch (group) {
            case 'Group 1': return '#cc2211'
            case 'Group 2': return '#22ee33'
            case 'Group 3': return '#2200cc'
            default: return '#999999'
          }
        }}
        tileLabel={(node: TreemapNode<TreemapExampleDatum>) => node.data.datum?.name}
        tileLabelColor="#ffffff" duration={props.duration}
      />
    </VisSingleContainer>
  )
}
