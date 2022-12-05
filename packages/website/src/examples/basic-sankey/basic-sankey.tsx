import React, { useCallback } from 'react'
import { FitMode, Position, Sizing } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/react'

import { data, NodeDatum } from './data'

export default function BasicSankey (): JSX.Element {
  return (
    <VisSingleContainer data={data} height={'50vh'}>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={window.innerWidth * 0.12}
        labelPosition={Position.Right}
        nodePadding={20}
        subLabel={useCallback((d: NodeDatum) => `£${d.value.toFixed(2)}`, [])}
      />
    </VisSingleContainer>
  )
}

