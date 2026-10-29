import React, { useMemo, useState } from 'react'
import { AxisType, CurveType, PlotlineLineStylePresets, Scale } from '@unovis/ts'
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend, VisPlotband, VisPlotline } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatMonth, formatValue } from './data'
import { seriesTooltip } from '../utils/tooltip'
import { COMPARISON_AXIS_TICK_SPACING, COMPARISON_TOOLTIP_PROPS } from '../constants'

const x = (d: DataRecord): number => d.date.getTime()
const formatTooltipValue = (value: number | undefined): string => value === undefined ? 'No data' : formatValue(value)
const TARGET = 50

export default function UnovisLineChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const xScale = useMemo(() => Scale.scaleTime(), [])
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? undefined : d[s.key])
  const legendItems = series.map(s => ({ name: s.label, inactive: hidden[s.key] }))
  const tooltipTemplate = (d: DataRecord): string => seriesTooltip(
    formatMonth(d.date),
    series.filter(s => !hidden[s.key]).map(s => ({ label: s.label, value: formatTooltipValue(d[s.key]), color: `var(--vis-color${series.indexOf(s)})` }))
  )

  // The months the iOS app reported no data, for the "Annotations" preset
  const outage = useMemo(() => data.filter(d => d.ios === undefined), [data])

  return (
    <>
      <VisBulletLegend items={legendItems} onLegendItemClick={toggleSeries}/>
      <VisXYContainer data={data} height={296} xScale={xScale} yDomainMaxConstraint={preset === 'annotations' ? [TARGET, undefined] : undefined}>
        <VisLine
          x={x}
          y={y}
          interpolateMissingData
          curveType={preset === 'step' ? CurveType.Step : CurveType.MonotoneX}
          lineDashArray={(_: DataRecord[], i: number) => preset === 'dashed' && series[i].key === 'ios' ? [6, 4] : undefined}
        />
        {preset === 'annotations' && outage.length > 0 && (
          <VisPlotband axis={AxisType.X} from={x(outage[0])} to={x(outage[outage.length - 1])} labelText="iOS outage"/>
        )}
        {preset === 'annotations' && <VisPlotline axis={AxisType.Y} value={TARGET} labelText={`Target ${formatValue(TARGET)}`} lineStyle={PlotlineLineStylePresets.Dash}/>}
        <VisAxis type="x" tickFormat={(t: Date) => formatMonth(t)} tickSpacing={COMPARISON_AXIS_TICK_SPACING}/>
        <VisAxis type="y" tickFormat={formatValue}/>
        <VisCrosshair template={tooltipTemplate}/>
        <VisTooltip container={document.body} {...COMPARISON_TOOLTIP_PROPS}/>
      </VisXYContainer>
    </>
  )
}
