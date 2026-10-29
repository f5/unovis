import React from 'react'
import { BulletShape, Heatmap, HeatmapLayoutType } from '@unovis/ts'
import { VisSingleContainer, VisHeatmap, VisTooltip, VisBulletLegend } from '@unovis/react'

import type { ChartProps } from '../types'
import { DataRecord, days, hours, rateDomain, formatHour, formatCell, getBuckets } from './data'
import { ORANGES } from './constants'

const tooltipTriggers = {
  [Heatmap.selectors.cell]: (cell: { datum: DataRecord }) => formatCell(cell.datum),
}

const dayLabel = (i: number): string => days[i]
const hourLabel = (i: number): string => formatHour(hours[i])

export default function UnovisHeatmap ({ data, preset }: ChartProps<DataRecord[]>): JSX.Element {
  // The legend takes the default colors from the same CSS variables as the cells, so it follows the dark theme too
  const colors = preset === 'buckets' ? ORANGES : Heatmap.selectors.defaultColorRange
  const legendItems = getBuckets(colors.length).map((b, i) => ({ name: b.label, color: colors[i], shape: BulletShape.Square }))
  // The data is a flat list, hour by hour: seven days fill each column, or with `HeatmapLayoutType.Row`, each row
  const isTransposed = preset === 'transposed'

  return (
    // Eight legend items take two rows, so the container fills the space under the legend instead of a fixed height
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <VisBulletLegend items={legendItems}/>
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
        <VisTooltip container={document.body} triggers={tooltipTriggers}/>
      </VisSingleContainer>
    </div>
  )
}
