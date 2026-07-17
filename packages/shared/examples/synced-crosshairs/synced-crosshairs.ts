import { Area, Axis, Crosshair, Direction, Line, Tooltip, XYContainer } from '@unovis/ts'
import { data, accessors, XYDataRecord } from './data'

let forcePosition: number | undefined = 75

const container = document.getElementById('vis-container')
container.innerHTML = `
  <div id="sc-status" style="margin-bottom: 10px; font-size: 14px; color: #666"></div>
  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px">
    ${[0, 25, 50, 75, 100, 125].map(v => `<button type="button" data-preset="${v}">${v}</button>`).join('')}
    <button type="button" id="sc-clear">clear</button>
    <input id="sc-range" type="range" min="0" max="150" step="1" value="${forcePosition ?? 0}" style="flex: 1"/>
  </div>
  <div id="sc-chart-1"></div>
  <div id="sc-chart-2"></div>
  <div style="height: 800px; width: 100%"></div>
`

const status = container.querySelector<HTMLDivElement>('#sc-status')
const range = container.querySelector<HTMLInputElement>('#sc-range')

const template = (d: XYDataRecord): string =>
  `Forced at: ${forcePosition}<br/>Data: ${d.x}`

const tooltip = new Tooltip({ container: document.body })

const crosshairs: Crosshair<XYDataRecord>[] = [
  new Crosshair<XYDataRecord>({ template, forceShowAt: forcePosition }),
  new Crosshair<XYDataRecord>({ template, forceShowAt: forcePosition }),
]

const charts: XYContainer<XYDataRecord>[] = [
  new XYContainer<XYDataRecord>(container.querySelector('#sc-chart-1'), {
    margin: { top: 5, left: 5 },
    components: [new Area<XYDataRecord>({ x: (d) => d.x, y: accessors })],
    xAxis: new Axis(),
    yAxis: new Axis(),
    crosshair: crosshairs[0],
    tooltip,
  }, data),
  new XYContainer<XYDataRecord>(container.querySelector('#sc-chart-2'), {
    margin: { top: 5, left: 5 },
    xDomain: [0, 100],
    yDirection: Direction.South,
    components: [new Line<XYDataRecord>({ x: (d) => d.x, y: accessors })],
    xAxis: new Axis(),
    yAxis: new Axis(),
    crosshair: crosshairs[1],
    tooltip,
  }, data),
]

function updatePosition (next: number | undefined): void {
  forcePosition = next
  status.textContent = `Crosshair forced to show at position: ${forcePosition ?? ''}`
  range.value = String(forcePosition ?? 0)
  for (const crosshair of crosshairs) crosshair.setConfig({ forceShowAt: forcePosition })
  for (const chart of charts) chart.render()
}

const onCrosshairMove = (x: number | Date | undefined): void =>
  updatePosition(typeof x === 'number' ? x : undefined)

for (const crosshair of crosshairs) crosshair.setConfig({ onCrosshairMove })

container.querySelectorAll<HTMLButtonElement>('button[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => updatePosition(Number(btn.dataset.preset)))
})
container.querySelector('#sc-clear').addEventListener('click', () => updatePosition(undefined))
range.addEventListener('input', (e) => updatePosition(Number((e.target as HTMLInputElement).value)))

updatePosition(forcePosition)
