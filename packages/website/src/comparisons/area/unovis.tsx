import React, { useMemo, useState } from 'react'
import { AxisType, CurveType, FillPatternType, PlotlineLineStylePresets, Scale } from '@unovis/ts'
import { VisXYContainer, VisArea, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend, VisPlotband, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatMonth, formatValue } from './data'
import { seriesTooltip } from '../utils/tooltip'
import { COMPARISON_TOOLTIP_PROPS } from '../constants'

const x = (d: DataRecord): number => d.date.getTime()
const patterns = [FillPatternType.StripesDiagonal, FillPatternType.Dots, FillPatternType.Crosshatch, FillPatternType.Waves]
const MIGRATION = { from: new Date(2024, 6, 1), to: new Date(2024, 8, 1) }
const BUDGET = 100

export default function UnovisAreaChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? 0 : d[s.key])
  const legendItems = series.map(s => ({ name: s.label, inactive: hidden[s.key] }))
  const tooltipTemplate = (d: DataRecord): string => seriesTooltip(
    formatMonth(d.date),
    series.filter(s => !hidden[s.key]).map(s => ({ label: s.label, value: formatValue(d[s.key]), color: `var(--vis-color${series.indexOf(s)})` }))
  )

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296} xScale={xScale}>
        <VisArea
          x={x}
          y={y}
          opacity={0.75}
          line
          lineWidth={1.5}
          curveType={preset === 'step' ? CurveType.Step : CurveType.MonotoneX}
          pattern={(_: DataRecord[], i: number) => preset === 'patterns' ? patterns[i] : undefined}
        />
        {preset === 'annotations' && <VisPlotband axis={AxisType.X} from={MIGRATION.from.getTime()} to={MIGRATION.to.getTime()} labelText="Migration"/>}
        {preset === 'annotations' && <VisPlotline axis={AxisType.Y} value={BUDGET} labelText={`Budget ${formatValue(BUDGET)}`} lineStyle={PlotlineLineStylePresets.Dash}/>}
        <VisAxis type="x" tickFormat={(t: Date) => formatMonth(t)} tickSpacing={100}/>
        <VisAxis type="y" tickFormat={formatValue}/>
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip container={document.body} {...COMPARISON_TOOLTIP_PROPS}/>
      </VisXYContainer>
    </>
  )
}
