import React, { useState } from 'react'
import { Direction, FillPatternType, FitMode, GroupedBar, Orientation } from '@unovis/ts'
import { VisXYContainer, VisGroupedBar, VisAxis, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, SeriesKey, series, formatValue } from './data'
import { seriesTooltip } from '../utils/tooltip'
import { COMPARISON_AXIS_TICK_SPACING, COMPARISON_TOOLTIP_PROPS } from '../constants'

const x = (_: DataRecord, i: number): number => i
const patterns = [FillPatternType.StripesDiagonal, FillPatternType.Dots, FillPatternType.Crosshatch]

export default function UnovisGroupedBarChart ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [hidden, setHidden] = useState<Partial<Record<SeriesKey, boolean>>>({})
  const toggleSeries = (_: unknown, i: number): void => setHidden({ ...hidden, [series[i].key]: !hidden[series[i].key] })

  const horizontal = preset === 'horizontal'
  const y = series.map(s => (d: DataRecord) => hidden[s.key] ? undefined : d[s.key])
  const legendItems = series.map((s, i) => ({ name: s.label, inactive: hidden[s.key], pattern: preset === 'patterns' ? patterns[i] : undefined }))
  const tooltipTemplate = (d: DataRecord): string => seriesTooltip(
    d.region,
    series.filter(s => !hidden[s.key]).map(s => ({ label: s.label, value: formatValue(d[s.key]), color: `var(--vis-color${series.indexOf(s)})` }))
  )

  // The regions go on the x axis, or on the y axis when the bars are horizontal
  const regionAxis = {
    numTicks: data.length,
    tickFormat: (i: number) => data[i]?.region,
    gridLine: false,
    tickTextFitMode: preset === 'trim-labels' ? FitMode.Trim : FitMode.Wrap,
    tickTextWidth: preset === 'trim-labels' ? 84 : undefined,
  }
  const valueAxis = { tickFormat: formatValue, tickSpacing: COMPARISON_AXIS_TICK_SPACING }

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
        <VisTooltip container={document.body} {...COMPARISON_TOOLTIP_PROPS} triggers={horizontal ? { [GroupedBar.selectors.bar]: tooltipTemplate } : {}}/>
      </VisXYContainer>
    </>
  )
}
