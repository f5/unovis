import { TransitionComponentProps } from '@/components/TransitionComponent'
import { generateNodeLinkData, NodeLinkData } from '@/utils/data'
import { VisSankey, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const transitionComponent: TransitionComponentProps<NodeLinkData> = {
  data: generateNodeLinkData,
  dataSeries: {
    noData: () => ({ nodes: [], links: [] }),
    singleNode: (d) => ({
      nodes: [d.nodes[0]],
      links: [],
    }),
    singleLink: () => ({
      nodes: ['a', 'b'].map(id => ({ id })),
      links: [{ source: 'a', target: 'b', value: 20 }],
    }),
  },
  component: (props) => (
    <VisSingleContainer data={props.data}>
      <VisSankey/>
    </VisSingleContainer>
  ),
}
