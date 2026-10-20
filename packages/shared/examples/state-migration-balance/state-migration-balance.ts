import { Axis, BulletLegend, Plotline, Scatter, StackedBar, Tooltip, XYContainer } from '@unovis/ts'
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
const labelSort = append(controls, 'label', 'gallery-select', 'Show states')
const controlSort = append(labelSort, 'select') as HTMLSelectElement
for (const option of c.sortOptions) {
  const element = append(controlSort, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlSort.addEventListener('change', (): void => update({ sort: controlSort.value }))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Interstate arrivals, departures, and net change')
const chartHost0 = append(panel0, 'div')
const component00 = new StackedBar({ x: c.rank, y: c.accessors, color: c.balanceColors, barPadding: 0.3 })
const component01 = new Scatter({ x: c.rank, y: c.net, color: 'var(--vis-color2)', size: 8 })
const component02 = new Plotline({ value: 0 })
const component03 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const axis00 = new Axis({ type: 'x', tickValues: c.rankTicks, tickFormat: view.stateLabel, tickTextAngle: -35, tickTextAlign: 'right', gridLine: false })
const axis01 = new Axis({ type: 'y', tickFormat: c.compact, label: 'People' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 460,
  duration: 600,
  components: [component00, component01, component02],
  tooltip: component03,
  xAxis: axis00,
  yAxis: axis01,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlSort.value = state.sort
  chart0.updateContainer({ ...chart0.config, height: 460, duration: 600 }, true)
  component00.setConfig({ x: c.rank, y: c.accessors, color: c.balanceColors, barPadding: 0.3 })
  component00.setData(view.data)
  component01.setConfig({ x: c.rank, y: c.net, color: 'var(--vis-color2)', size: 8 })
  component01.setData(view.data)
  component02.setConfig({ value: 0 })
  component03.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  axis00.setConfig({ type: 'x', tickValues: c.rankTicks, tickFormat: view.stateLabel, tickTextAngle: -35, tickTextAlign: 'right', gridLine: false })
  axis01.setConfig({ type: 'y', tickFormat: c.compact, label: 'People' })
  chart0.render()
}

render()
