<script setup lang="ts">
  import { VisXYContainer, VisLine, VisArea, VisScatter, VisAxis, VisCrosshair, VisTooltip } from '@unovis/svelte'
  import { data1, data2, data3 } from './data'

  const height = 200

  const x = (d) => d.x
  const y = (d) => d.y

  const tooltipTemplate = (d) => {
    return `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`
  }
</script>

<div style="display: flex; flex-direction: column; gap: 20px;">
  <div>
    <h4>Line Chart</h4>
    <VisXYContainer data={data1} {height}>
      <VisLine {x} {y} />
      <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
      <VisTooltip />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  </div>

  <div>
    <h4>Area Chart</h4>
    <VisXYContainer data={data2} {height}>
      <VisArea {x} {y} />
      <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
      <VisTooltip />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  </div>

  <div>
    <h4>Scatter Plot</h4>
    <VisXYContainer data={data3} {height}>
      <VisScatter {x} {y} />
      <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
      <VisTooltip />
      <VisAxis type="x" />
      <VisAxis type="y" />
    </VisXYContainer>
  </div>

  <div style="font-size: 14px; color: #666; text-align: center; margin-top: 10px;">
    Hover over any chart to see synchronized crosshairs across all three charts
  </div>
</div>

