import React, { useState } from 'react'
import { RadialBar, RadialBarArcDatum, RadialBarConfigInterface } from '@unovis/ts'
import { VisSingleContainer, VisRadialBar, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, resources, formatUsage, formatAverageUsage } from './data'

const color = (d: DataRecord): string => `var(--vis-color${resources.findIndex(r => r.key === d.key)})`
// A prop set to `undefined` replaces the component's default, so every preset only passes the options it changes.
// The chart fits the bounding box of the angle range, so the gauge is enlarged to fill the chart
const presetConfig: Record<string, Partial<RadialBarConfigInterface<DataRecord>>> = {
  rounded: { cornerRadius: 8 },
  gauge: { angleRange: [-3 * Math.PI / 4, 3 * Math.PI / 4] },
  thick: { trackWidth: 28, trackPadding: 4 },
}

const tooltipTriggers = {
  [RadialBar.selectors.bar]: (d: RadialBarArcDatum<DataRecord>) => `<b>${d.data.label}</b>: ${formatUsage(d.data)}`,
}

export default function UnovisRadialBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = resources.map(r => ({ name: r.label, inactive: hidden[r.key] }))
  const toggleResource = (_: unknown, i: number): void => setHidden({ ...hidden, [resources[i].key]: !hidden[resources[i].key] })

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleResource}/>
      <VisSingleContainer data={data.filter(d => !hidden[d.key])} height={416}>
        <VisRadialBar
          id={(d: DataRecord) => d.key}
          value={(d: DataRecord) => d.used}
          maxValue={(d: DataRecord) => d.quota}
          color={color}
          centralLabel={formatAverageUsage(data)}
          centralSubLabel="of the quotas used"
          {...presetConfig[preset]}
        />
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
