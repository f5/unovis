import React, { useCallback } from 'react'
import { FitMode } from '@volterra/vis'
import { VisSingleContainer, VisSankey } from '@volterra/vis-react'

import { data, NodeDatum } from './data'

export default function BasicSankey (): JSX.Element {
  return (
    <VisSingleContainer data={data} height={400}>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={150}
        nodePadding={20}
        subLabel={useCallback((d: NodeDatum) => `£${d.value.toFixed(2)}`, [])}
      />
    </VisSingleContainer>
  )
}

