import React, { useMemo, useState } from 'react'
import { Scale } from '@unovis/ts'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'

import { DataRecord, SeriesKey, series, formatMonth, formatValue } from './data'

const x = (d: DataRecord): number => d.date.getTime()
const formatTooltipValue = (value: number | undefined): string => value === undefined ? 'No data' : formatValue(value)

export default function UnovisLineChart ({ data }: { data: DataRecord[] }): JSX.Element {
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? undefined : d[s.key])
  const legendItems = series.map(s => ({ name: s.label, inactive: hidden[s.key] }))
  const tooltipTemplate = (d: DataRecord): string => `
    <b>${formatMonth(d.date)}</b>
    ${series.map((s, i) => hidden[s.key] ? '' : `<div><span style="color: var(--vis-color${i})">●</span> ${s.label}: ${formatTooltipValue(d[s.key])}</div>`).join('')}
  `

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296} xScale={xScale}>
        <VisLine x={x} y={y} interpolateMissingData/>
        <VisAxis type="x" tickFormat={(t: Date) => formatMonth(t)}/>
        <VisAxis type="y" tickFormat={formatValue}/>
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip/>
      </VisXYContainer>
    </>
  )
}
