import React, { useState } from 'react'
import { Direction, FillPatternType, Orientation, PlotlineLineStylePresets, StackedBar } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'

const x = (_: DataRecord, i: number): number => i
const patterns = [FillPatternType.StripesDiagonal, FillPatternType.Dots, FillPatternType.Crosshatch, FillPatternType.Waves]
const CAPACITY = 400

export default function UnovisStackedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? 0 : d[s.key])
  const withPatterns = preset === 'patterns'
  const legendItems = series.map((s, i) => ({ name: s.label, inactive: hidden[s.key], pattern: withPatterns ? patterns[i] : undefined }))
  const tooltipTemplate = (d: DataRecord): string => `
    <b>${d.month}</b>
    ${series.map((s, i) => hidden[s.key] ? '' : `<div><span style="color: var(--vis-color${i})">●</span> ${s.label}: ${formatValue(d[s.key])}</div>`).join('')}
  `

  // The months go on the y axis when the bars are horizontal; the crosshair only follows the x axis, so the tooltip
  // moves to the bars
  const isHorizontal = preset === 'horizontal'
  const monthAxis = { numTicks: data.length, tickFormat: (i: number) => data[i]?.month, gridLine: false }
  const valueAxis = { tickFormat: formatValue }

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296} yDirection={isHorizontal ? Direction.South : Direction.North}>
        <VisStackedBar
          x={x}
          y={y}
          orientation={isHorizontal ? Orientation.Horizontal : Orientation.Vertical}
          pattern={withPatterns ? (_: DataRecord, i: number) => patterns[i] : undefined}
        />
        {preset === 'capacity' && <VisPlotline axis="y" value={CAPACITY} labelText={`Capacity ${formatValue(CAPACITY)}`} lineStyle={PlotlineLineStylePresets.Dash}/>}
        <VisAxis type="x" {...(isHorizontal ? valueAxis : monthAxis)}/>
        <VisAxis type="y" {...(isHorizontal ? monthAxis : valueAxis)}/>
        {!isHorizontal && <VisCrosshair template={tooltipTemplate}/>}
        <VisTooltip triggers={isHorizontal ? { [StackedBar.selectors.bar]: (bar: { datum: DataRecord }) => tooltipTemplate(bar.datum) } : {}}/>
      </VisXYContainer>
    </>
  )
}
