import React, { useCallback } from 'react'
import { FitMode } from '@unovis/ts'
import { VisSingleContainer, VisSankey } from '@unovis/react'

import { data, NodeDatum } from './data'

export default function BasicSankey (): JSX.Element {
  return (
    <VisSingleContainer data={data} height={'60vh'}>
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

