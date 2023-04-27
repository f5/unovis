import React from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import { TransitionComponentProps } from '@src/components/TransitionComponent'
import { generateNodeLinkData, NodeLinkData } from '@src/utils/data'

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
