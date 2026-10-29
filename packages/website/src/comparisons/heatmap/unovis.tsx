import React from 'react'
import { Heatmap, HeatmapLayoutType } from '@unovis/ts'
import { VisSingleContainer, VisHeatmap, VisTooltip, VisRollingPinLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { textTooltip } from '../utils/tooltip'
import { DataRecord, days, hours, rateDomain, formatHour, formatRate } from './data'
import { ORANGES, LEGEND_WIDTH } from './constants'
import { COMPARISON_TOOLTIP_PROPS } from '../constants'

const tooltipTriggers = {
  [Heatmap.selectors.cell]: (cell: { datum: DataRecord }) => textTooltip(`${cell.datum.day} ${formatHour(cell.datum.hour)}`, [
    cell.datum.errorRate === null ? 'No data' : formatRate(cell.datum.errorRate),
  ]),
}

const dayLabel = (i: number): string => days[i]
const hourLabel = (i: number): string => formatHour(hours[i])

export default function UnovisHeatmap ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // The legend takes the default colors from the same CSS variables as the cells, so it follows the dark theme too
  const colors = preset === 'buckets' ? ORANGES : Heatmap.selectors.defaultColorRange
  // The data is a flat list, hour by hour: seven days fill each column, or with `HeatmapLayoutType.Row`, each row
  const isTransposed = preset === 'transposed'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', '--vis-rolling-pin-legend-item-width': `${LEGEND_WIDTH / colors.length}px` } as React.CSSProperties}>
      <VisRollingPinLegend rects={colors} leftLabelText={`${rateDomain[0]}%`} rightLabelText={`${rateDomain[1]}%`}/>
      <VisSingleContainer data={data} style={{ flex: 1, minHeight: 0 }}>
        <VisHeatmap
          value={(d: DataRecord) => d.errorRate}
          colorDomain={rateDomain}
          colorRange={preset === 'buckets' ? ORANGES : undefined}
          layout={isTransposed ? HeatmapLayoutType.Row : HeatmapLayoutType.Column}
          numRows={isTransposed ? undefined : days.length}
          numColumns={isTransposed ? days.length : undefined}
          columnLabel={isTransposed ? dayLabel : hourLabel}
          rowLabel={isTransposed ? hourLabel : dayLabel}
          {...(preset === 'rounded' && { cellPadding: 5, cellCornerRadius: 6 })}
        />
        <VisTooltip container={document.body} {...COMPARISON_TOOLTIP_PROPS} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </div>
  )
}
