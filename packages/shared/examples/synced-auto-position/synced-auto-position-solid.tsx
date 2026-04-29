import { VisXYContainer, VisLine, VisAxis, VisPlotline } from '@unovis/solid'
import { LabelOverflow } from '@unovis/ts'
import { For, JSX } from 'solid-js'

import { data, thresholds, DataRecord } from './data'

const SyncedAutoPosition = (): JSX.Element => {
  const margin = { top: 10, right: 200, bottom: 30, left: 40 }

  return (
    <VisXYContainer data={data} height={400} margin={margin} yDomain={[5.0, 7.0]}>
      <VisLine x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      <For each={thresholds}>
        {(t) => (
          <VisPlotline
            value={t.value}
            labelText={t.label}
            labelPosition='top-right'
            labelAutoPosition={true}
            labelOverflow={LabelOverflow.Smart}
            color='#666'
            lineStyle='dash'
          />
        )}
      </For>
    </VisXYContainer>
  )
}

export default SyncedAutoPosition
