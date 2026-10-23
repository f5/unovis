import React, { useState } from 'react'
import { CircularBar, CircularBarArcDatum } from '@unovis/ts'
import { VisSingleContainer, VisCircularBar, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, metrics, formatValue } from './data'
import { HEALTH_ICON_SYMBOLS } from './constants'

const color = (d: DataRecord): string => `var(--vis-color${metrics.findIndex(m => m.key === d.key)})`
const tooltipTriggers = {
  [CircularBar.selectors.bar]: (d: CircularBarArcDatum<DataRecord>) => `<b>${d.data.label}</b>: ${formatValue(d.data)}`,
}

export default function UnovisCircularBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})
  const legendItems = metrics.map(m => ({ name: m.label, inactive: hidden[m.key] }))
  const toggleMetric = (_: unknown, i: number): void => setHidden({ ...hidden, [metrics[i].key]: !hidden[metrics[i].key] })

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleMetric}/>
      <VisSingleContainer data={data.filter(d => !hidden[d.key])} height={416} svgDefs={HEALTH_ICON_SYMBOLS}>
        <VisCircularBar
          id={(d: DataRecord) => d.key}
          value={(d: DataRecord) => d.value}
          maxValue={(d: DataRecord) => d.goal}
          color={color}
          icon={(d: DataRecord) => `#health-icon-${d.key}`}
          // The chart fits the bounding box of the angle range, so a half circle is enlarged to fill the chart
          angleRange={preset === 'half' ? [-Math.PI / 2, Math.PI / 2] : undefined}
          cornerRadius={preset === 'square' ? 0 : undefined}
          innerCornerRadius={preset === 'square' ? 0 : undefined}
          barPadding={preset === 'gaps' ? 24 : undefined}
        />
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </>
  )
}
