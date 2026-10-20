import { Axis, Boxplot, BulletLegend, Scatter, Tooltip, XYContainer } from '@unovis/ts'
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
const labelSex = append(controls, 'label', 'gallery-select', 'Sex')
const controlSex = append(labelSex, 'select') as HTMLSelectElement
for (const option of c.sexOptions) {
  const element = append(controlSex, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlSex.addEventListener('change', (): void => update({ sex: controlSex.value }))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Body mass by species')
const chartHost0 = append(panel0, 'div')
const component00 = new Scatter({ x: c.pointX, y: c.pointY, size: 5, color: c.pointColor })
const component01 = new Boxplot({
  x: c.boxX,
  median: c.median,
  quartiles: c.quartiles,
  whiskers: c.whiskers,
  color: c.boxColor,
  barPadding: 0.55,
})
const component02 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const axis00 = new Axis({ type: 'x', tickValues: c.speciesTicks, tickFormat: c.speciesLabel, gridLine: false })
const axis01 = new Axis({ type: 'y', label: 'Body mass (g)' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 420,
  duration: 600,
  components: [component00, component01],
  tooltip: component02,
  xAxis: axis00,
  yAxis: axis01,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlSex.value = state.sex
  chart0.updateContainer({ ...chart0.config, height: 420, duration: 600 }, true)
  component00.setConfig({ x: c.pointX, y: c.pointY, size: 5, color: c.pointColor })
  component00.setData(view.points)
  component01.setConfig({ x: c.boxX, median: c.median, quartiles: c.quartiles, whiskers: c.whiskers, color: c.boxColor, barPadding: 0.55 })
  component01.setData(view.boxes)
  component02.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  axis00.setConfig({ type: 'x', tickValues: c.speciesTicks, tickFormat: c.speciesLabel, gridLine: false })
  axis01.setConfig({ type: 'y', label: 'Body mass (g)' })
  chart0.render()
}

render()
