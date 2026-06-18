import React from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import { FitMode } from '@unovis/ts'

export const title = 'Sankey: Single Node Long Label'
export const subTitle = 'Label wrapping'

const data = {
  nodes: [
    {
      id: 'A',
      label: 'A single node with an exceptionally long label that should wrap across multiple lines',
      subLabel: 'And a fairly long sub-label too, to verify wrapping behavior',
    },
  ],
  links: [],
}

export const component = (): React.ReactNode => (
  <VisSingleContainer data={data}>
    <VisSankey
      label={(d: typeof data.nodes[0]) => d.label}
      subLabel={(d: typeof data.nodes[0]) => d.subLabel}
      labelFit={FitMode.Wrap}
      labelForceWordBreak={false}
    />
  </VisSingleContainer>
)
