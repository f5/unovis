import React, { useState } from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import { Sizing } from '@unovis/ts'

import { collapseExampleData, Node, Link } from './data'

export const title = 'Sankey Node Collapse'
export const subTitle = 'Click on nodes to collapse/expand them'

export const component = (): React.ReactNode => {
  const [data] = useState<{ nodes: Node[]; links: Link[] }>(collapseExampleData)

  return (
    <div>
      <VisSingleContainer data={data} sizing={Sizing.Fit} height={400}>
        <VisSankey<Node, Link>
          // Enable the new collapse functionality
          enableNodeCollapse={true}
          collapseAnimationDuration={500}
          disabledField="disabled" // Pre-collapse nodes with disabled: true
          nodeWidth={30}
          nodePadding={10}
          nodeColor={(d: Node) => d.color}
          label={(d: Node) => d.label}
          labelPosition="auto"
          labelMaxWidth={100}
          linkValue={(d) => d.value}
        />
      </VisSingleContainer>
    </div>
  )
}
