import React, { useState } from 'react'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'

import { DataRecord, SeriesKey, series, formatValue } from './data'

const x = (_: DataRecord, i: number): number => i

export default function UnovisStackedBarChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? 0 : d[s.key])
  const legendItems = series.map(s => ({ name: s.label, inactive: hidden[s.key] }))
  const tooltipTemplate = (d: DataRecord): string => `
    <b>${d.month}</b>
    ${series.map((s, i) => hidden[s.key] ? '' : `<div><span style="color: var(--vis-color${i})">●</span> ${s.label}: ${formatValue(d[s.key])}</div>`).join('')}
  `

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296}>
        <VisStackedBar x={x} y={y}/>
        <VisAxis type="x" numTicks={data.length} tickFormat={(i: number) => data[i]?.month} gridLine={false}/>
        <VisAxis type="y" tickFormat={formatValue}/>
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip/>
      </VisXYContainer>
    </>
  )
}
