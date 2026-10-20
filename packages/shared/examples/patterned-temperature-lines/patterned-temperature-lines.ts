import { Axis, BulletLegend, Crosshair, Line, Tooltip, XYContainer } from '@unovis/ts'
import * as c from './constants'
import './styles.css'

function append (parent: HTMLElement, tag: string, className = '', text = ''): HTMLElement {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text
  return parent.appendChild(element)
}

const host = document.getElementById('vis-container') as HTMLElement
const root = append(host, 'div', 'gallery-example')
let state: c.ExampleState = { ...c.initialState }
let render = (): void => undefined

function update (patch: Partial<c.ExampleState>): void {
  state = { ...state, ...patch }
  render()
}

let view = c.getView(state)

const controls = append(root, 'div', 'gallery-controls')
const labelMode = append(controls, 'label', 'gallery-select', 'Appearance')
const controlMode = append(labelMode, 'select') as HTMLSelectElement
for (const option of c.modeOptions) {
  const element = append(controlMode, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlMode.addEventListener('change', (): void => update({ mode: controlMode.value }))
const legend = new BulletLegend(append(root, 'div'), { items: view.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Seven-day mean temperature \u00b7 \u00b0C')
const chartHost0 = append(panel0, 'div')
const component00 = new Line({
  x: c.time,
  y: c.accessors,
  pattern: c.pattern,
  color: view.colors,
  lineWidth: 1.6,
  curveType: c.CurveType.Linear,
})
const component01 = new Crosshair({ template: c.crosshairTemplate })
const component02 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer })
const axis00 = new Axis({ type: 'x', tickFormat: c.monthLabel, numTicks: 6 })
const axis01 = new Axis({ type: 'y', label: 'Temperature (°C)' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 420,
  duration: 600,
  components: [component00],
  crosshair: component01,
  tooltip: component02,
  xAxis: axis00,
  yAxis: axis01,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: view.legend })
  controlMode.value = state.mode
  chart0.updateContainer({ ...chart0.config, height: 420, duration: 600 }, true)
  component00.setConfig({
    x: c.time,
    y: c.accessors,
    pattern: c.pattern,
    color: view.colors,
    lineWidth: 1.6,
    curveType: c.CurveType.Linear,
  })
  component00.setData(c.data)
  component01.setConfig({ template: c.crosshairTemplate })
  component01.setData(c.data)
  component02.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer })
  axis00.setConfig({ type: 'x', tickFormat: c.monthLabel, numTicks: 6 })
  axis01.setConfig({ type: 'y', label: 'Temperature (°C)' })
  chart0.render()
}

render()
