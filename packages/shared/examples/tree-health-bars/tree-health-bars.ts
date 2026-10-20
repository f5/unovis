import { Axis, BulletLegend, StackedBar, Tooltip, XYContainer } from '@unovis/ts'
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
const labelSort = append(controls, 'label', 'gallery-select', 'Sort boroughs')
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
append(panel0, 'p', 'gallery-caption', 'Share of living trees \u00b7 %')
const chartHost0 = append(panel0, 'div')
const component00 = new StackedBar({ x: c.rank, y: c.accessors, orientation: 'horizontal', color: c.healthColors, barPadding: 0.35 })
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const axis00 = new Axis({ type: 'x', label: 'Share of living trees (%)', tickValues: c.percentTicks })
const axis01 = new Axis({ type: 'y', tickValues: c.rankTicks, tickFormat: view.boroughLabel, gridLine: false })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 390,
  duration: 600,
  xDomain: c.percentDomain,
  yDirection: 'south',
  components: [component00],
  tooltip: component01,
  xAxis: axis00,
  yAxis: axis01,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlSort.value = state.sort
  chart0.updateContainer({ ...chart0.config, height: 390, duration: 600, xDomain: c.percentDomain, yDirection: 'south' }, true)
  component00.setConfig({ x: c.rank, y: c.accessors, orientation: 'horizontal', color: c.healthColors, barPadding: 0.35 })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  axis00.setConfig({ type: 'x', label: 'Share of living trees (%)', tickValues: c.percentTicks })
  axis01.setConfig({ type: 'y', tickValues: c.rankTicks, tickFormat: view.boroughLabel, gridLine: false })
  chart0.render()
}

render()
