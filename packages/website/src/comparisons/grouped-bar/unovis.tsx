import React, { useState } from 'react'
import { Direction, FillPatternType, FitMode, GroupedBar, Orientation } from '@unovis/ts'
import { VisXYContainer, VisGroupedBar, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'

const x = (_: DataRecord, i: number): number => i
const patterns = [FillPatternType.StripesDiagonal, FillPatternType.Dots, FillPatternType.Crosshatch]

export default function UnovisGroupedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const horizontal = preset === 'horizontal'
  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? undefined : d[s.key])
  const legendItems = series.map((s, i) => ({ name: s.label, inactive: hidden[s.key], pattern: preset === 'patterns' ? patterns[i] : undefined }))
  const tooltipTemplate = (d: DataRecord): string => `
    <b>${d.region}</b>
    ${series.map((s, i) => hidden[s.key] ? '' : `<div><span style="color: var(--vis-color${i})">●</span> ${s.label}: ${formatValue(d[s.key])}</div>`).join('')}
  `

  // The regions go on the x axis, or on the y axis when the bars are horizontal
  const regionAxis = {
    numTicks: data.length,
    tickFormat: (i: number) => data[i]?.region,
    gridLine: false,
    tickTextFitMode: preset === 'trim-labels' ? FitMode.Trim : FitMode.Wrap,
    tickTextWidth: preset === 'trim-labels' ? 84 : undefined,
  }
  const valueAxis = { tickFormat: formatValue }

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296} yDirection={horizontal ? Direction.South : Direction.North}>
        <VisGroupedBar
          x={x}
          y={y}
          orientation={horizontal ? Orientation.Horizontal : Orientation.Vertical}
          pattern={preset === 'patterns' ? (_: DataRecord, i: number) => patterns[i] : undefined}
        />
        <VisAxis type="x" {...(horizontal ? valueAxis : regionAxis)}/>
        <VisAxis type="y" {...(horizontal ? regionAxis : valueAxis)}/>
        {/* The crosshair moves along the x axis, so horizontal bars show the region's tooltip on hover instead */}
        {!horizontal && <VisCrosshair template={tooltipTemplate} getCircles={() => []}/>}
        <VisTooltip triggers={horizontal ? { [GroupedBar.selectors.bar]: tooltipTemplate } : {}}/>
      </VisXYContainer>
    </>
  )
}
