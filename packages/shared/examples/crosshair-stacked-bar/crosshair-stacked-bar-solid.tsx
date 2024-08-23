import { Position } from '@unovis/ts'
import { VisAxis, VisCrosshair, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/solid'
import { For, JSX } from 'solid-js'

import { data, labels, DataRecord, FormatConfig } from './data'

const CrosshairStackedBar = (): JSX.Element => {
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
    const dataLegend = labels
      .filter((f) => d[f.format] > 0)
      .reverse()
      .map(
        (f) =>
          `<span>${getIcon({
            ...f,
            label: numberFormat(d[f.format] * Math.pow(10, 10)),
          })}`
      )
      .join('</span>')
    return `<div><b>${d.year}</b>: ${dataLegend}</div>`
  }

  return (
    <div>
      <link
        rel='stylesheet'
        href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css'
      />
      <div>
        <For each={labels}>
          {(l) => <span style='margin-right: 20px' innerHTML={getIcon(l)}></span>}
        </For>
      </div>
      <VisXYContainer data={data} height={height}>
        <VisStackedBar x={x} y={y} />
        <VisCrosshair template={tooltipTemplate} />
        <VisTooltip
          verticalShift={height}
          horizontalPlacement={Position.Center}
        />
        <VisAxis type='x' />
      </VisXYContainer>
    </div>
  )
}

export default CrosshairStackedBar
