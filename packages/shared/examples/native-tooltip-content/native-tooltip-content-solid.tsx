import type { JSX } from 'solid-js'
import { VisXYContainer, VisLine, VisScatter, VisCrosshair, VisAxis, VisTooltip } from '@unovis/solid'

import { data, DataRecord, formatDay, formatRevenue, tooltipTemplate } from './data'
import { CHART_HEIGHT } from './constants'
import './styles.css'

export default function NativeTooltipContent (): JSX.Element {
  const x = (d: DataRecord): number => d.day
  const y = (d: DataRecord): number => d.revenue

  return <div class='native-tooltip-content'>
    <h4>Daily revenue</h4>
    <p class='hint'>Move across the chart to inspect daily revenue.</p>
    <VisXYContainer data={data} height={CHART_HEIGHT}>
      <VisLine x={x} y={y} />
      <VisScatter x={x} y={y} size={8} />
      <VisCrosshair x={x} y={y} template={tooltipTemplate} />
      <VisAxis type='x' tickFormat={formatDay} numTicks={7} />
      <VisAxis type='y' tickFormat={value => formatRevenue(Number(value))} />
      <VisTooltip className='native-tooltip-content-popup' />
    </VisXYContainer>
  </div>
}
