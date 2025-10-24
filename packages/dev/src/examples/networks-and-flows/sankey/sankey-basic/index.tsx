import React from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import { Position } from '@unovis/ts'

export const title = 'Basic Sankey'
export const subTitle = 'Label position'

const data = {
  nodes: [
    { id: 'A', label: 'Alpha Source', subLabel: 'Total Input' },
    { id: 'B', label: 'Beta Stage', subLabel: 'Direct Output' },
    { id: 'C', label: 'Gamma Processing', subLabel: 'Split to Destinations' },
    { id: 'D', label: 'Delta Sink', subLabel: 'Primary Destination' },
    { id: 'E', label: 'Epsilon Endpoint', subLabel: 'External Export' },
    { id: 'F', label: 'Fallback Flow', subLabel: 'Return/Recycle' },
  ],
  links: [
    { source: 'A', target: 'B', value: 28 },
    { source: 'A', target: 'C', value: 72 },
    { source: 'C', target: 'D', value: 37 },
    { source: 'C', target: 'E', value: 10.5 },
    { source: 'C', target: 'F', value: 24.5 },
  ],
}

export const component = (): React.ReactNode => {
  const [labelPosition, setLabelPosition] = React.useState<Position.Auto | Position.Left | Position.Right | string>(Position.Auto)

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <label>
          Label position{' '}
          <select
            value={labelPosition}
            onChange={e => setLabelPosition(e.target.value as Position.Auto | Position.Left | Position.Right | string)}
          >
            <option value={Position.Auto}>Auto</option>
            <option value={Position.Left}>Left</option>
            <option value={Position.Right}>Right</option>
          </select>
        </label>
      </div>
      <VisSingleContainer data={data}>
        <VisSankey
          label={(d: typeof data.nodes[0]) => d.label}
          labelForceWordBreak={false}
          labelPosition={labelPosition}
          subLabel={(d: typeof data.nodes[0]) => d.subLabel}
          selectedNodeIds={['A']}
        />
      </VisSingleContainer>
    </>
  )
}
