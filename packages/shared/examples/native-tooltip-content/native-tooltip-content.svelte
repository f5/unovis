<script lang="ts">
  import { VisXYContainer, VisLine, VisScatter, VisCrosshair, VisAxis, VisTooltip } from '@unovis/svelte'

  import type { DataRecord } from './data'
  import { data, formatDay, formatRevenue, tooltipTemplate } from './data'
  import { CHART_HEIGHT } from './constants'
  import './styles.css'

  const x = (d: DataRecord): number => d.day
  const y = (d: DataRecord): number => d.revenue
  const formatTick = (value: number | Date): string => formatRevenue(Number(value))
</script>

<div class="native-tooltip-content">
  <h4>Daily revenue</h4>
  <p class="hint">Move across the chart to inspect daily revenue.</p>
  <VisXYContainer {data} height={CHART_HEIGHT}>
    <VisLine {x} {y}/>
    <VisScatter {x} {y} size={8}/>
    <VisCrosshair {x} {y} template={tooltipTemplate}/>
    <VisAxis type="x" tickFormat={formatDay} numTicks={7}/>
    <VisAxis type="y" tickFormat={formatTick}/>
    <VisTooltip className="native-tooltip-content-popup" />
  </VisXYContainer>
</div>
