import { JSX } from 'solid-js'
import { FitMode } from '@unovis/ts'
import { VisSankey, VisSingleContainer } from '@unovis/solid'

import { data, NodeDatum } from './data'

const BasicSankey = (): JSX.Element => {
  const subLabel = (d: NodeDatum) => `£${d.value.toFixed(2)}`

  return (
    <VisSingleContainer data={data} height='50dvh'>
      <VisSankey
        labelFit={FitMode.Wrap}
        labelForceWordBreak={false}
        labelMaxWidth={150}
        nodePadding={20}
        subLabel={subLabel}
      />
    </VisSingleContainer>
  )
}

export default BasicSankey
