import React from 'react'
import { NestedDonut, NestedDonutDirection, NestedDonutSegment } from '@unovis/ts'
import { VisSingleContainer, VisNestedDonut, VisTooltip } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, formatValue } from './data'

const layers = [(d: DataRecord) => d.platform, (d: DataRecord) => d.os, (d: DataRecord) => d.browser]
const tooltipTriggers = {
  [NestedDonut.selectors.segment]: (d: NestedDonutSegment<DataRecord>) => `<b>${d.data.key}</b>: ${formatValue(d.value)}`,
}

// Ring widths in pixels, from the platforms in the middle to the browsers outside, for the "Ring widths" preset
const ringWidths = [30, 45, 90]

export default function UnovisNestedDonutChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  return (
    <VisSingleContainer data={data} height={440}>
      <VisNestedDonut
        layers={layers}
        value={(d: DataRecord) => d.sessions}
        // The rings go inwards by default, with the top level outside; the sunburst layout starts from the middle
        direction={preset === 'inwards' ? NestedDonutDirection.Inwards : NestedDonutDirection.Outwards}
        // The default angle range is the full circle; NestedDonut doesn't fall back to it when the prop is `undefined`
        angleRange={preset === 'half' ? [-Math.PI / 2, Math.PI / 2] : [0, 2 * Math.PI]}
        layerSettings={preset === 'widths' ? (i: number) => ({ width: ringWidths[i] }) : undefined}
      />
      <VisTooltip container={document.body} triggers={tooltipTriggers}/>
    </VisSingleContainer>
  )
}
