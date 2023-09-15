<script lang='ts'>
  // eslint-disable svelte/no-at-html-tags
  import { Position } from '@unovis/ts'
  import { VisAxis, VisCrosshair, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/svelte'
  import { data, labels, DataRecord, FormatConfig } from './data'

  const height = 450
  const x = (d: DataRecord) => d.year
  const y = labels.map((l: FormatConfig) => (d: DataRecord) => d[l.format])

  function getIcon (f: FormatConfig): string {
    return `<span class="bi bi-${f.icon}" style="color:${f.color}; margin:0 4px"></span>${f.label}\t`
  }

  function tooltipTemplate (d: DataRecord): string {
    const numberFormat = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format
    const dataLegend = labels.filter(f => d[f.format] > 0)
      .reverse()
      .map(f => `<span>${getIcon({ ...f, label: numberFormat(d[f.format] * Math.pow(10, 10)) })}`)
      .join('</span>')
    return `<div><b>${d.year}</b>: ${dataLegend}</div>`
  }
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"/>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div>{@html labels.map(l => `<span style="margin-right: 20px">${getIcon(l)}</span>`).join('')}</div>
<VisXYContainer {data} {height}>
  <VisStackedBar {x} {y}/>
  <VisCrosshair template={tooltipTemplate}/>
  <VisTooltip verticalShift={height} horizontalPlacement={Position.Center}/>
  <VisAxis type="x" />
</VisXYContainer>
