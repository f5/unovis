import React, { useState } from 'react'
import { Direction, FillPatternType, Orientation, PlotlineLineStylePresets, StackedBar } from '@unovis/ts'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'
import { seriesTooltip } from '../utils/tooltip'
import { COMPARISON_AXIS_TICK_SPACING, COMPARISON_TOOLTIP_PROPS } from '../constants'

const x = (_: DataRecord, i: number): number => i
const patterns = [FillPatternType.StripesDiagonal, FillPatternType.Dots, FillPatternType.Crosshatch, FillPatternType.Waves]
const CAPACITY = 400

export default function UnovisStackedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? 0 : d[s.key])
  const withPatterns = preset === 'patterns'
  const legendItems = series.map((s, i) => ({ name: s.label, inactive: hidden[s.key], pattern: withPatterns ? patterns[i] : undefined }))
  const tooltipTemplate = (d: DataRecord): string => seriesTooltip(
    d.month,
    series.filter(s => !hidden[s.key]).map(s => ({ label: s.label, value: formatValue(d[s.key]), color: `var(--vis-color${series.indexOf(s)})` }))
  )

  // The months go on the y axis when the bars are horizontal; the crosshair only follows the x axis, so the tooltip
  // moves to the bars
  const isHorizontal = preset === 'horizontal'
  const monthAxis = { numTicks: data.length, tickFormat: (i: number) => data[i]?.month, gridLine: false }
  const valueAxis = { tickFormat: formatValue, tickSpacing: COMPARISON_AXIS_TICK_SPACING }

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
        <VisTooltip container={document.body} {...COMPARISON_TOOLTIP_PROPS} triggers={isHorizontal ? { [StackedBar.selectors.bar]: (bar: { datum: DataRecord }) => tooltipTemplate(bar.datum) } : {}}/>
      </VisXYContainer>
    </>
  )
}
