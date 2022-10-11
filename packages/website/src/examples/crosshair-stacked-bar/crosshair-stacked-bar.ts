import { Axis, Crosshair, Position, StackedBar, Tooltip, XYContainer } from '@unovis/ts'
import { data, labels, DataRecord, FormatConfig } from './data'

function getIcon (f: FormatConfig): string {
  return `<span class="bi bi-${f.icon}" style="color:${f.color}; margin:0 4px"></span>${f.label}\t`
}

const height = 500
const container = document.getElementById('vis-container')
container.innerHTML = `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css"/>
  ${labels.map(l => `<span style="margin-right: 10px">${getIcon(l)}</span>`).join('')}
`

const bar = new StackedBar<DataRecord>({
  x: (d: DataRecord) => d.year,
  y: labels.map((l: FormatConfig) => (d: DataRecord) => d[l.format]),
})

const crosshair = new Crosshair({
  template: (d: DataRecord): string => {
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
  },
})

const chart = new XYContainer(container, {
  height,
  components: [bar],
  crosshair,
  tooltip: new Tooltip({ verticalShift: height, horizontalPlacement: Position.Center }),
  xAxis: new Axis(),
}, data)
