import { Axis, BulletLegend, Plotline, Timeline, Tooltip, XYContainer } from '@unovis/ts'
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
const labelStatus = append(controls, 'label', 'gallery-select', 'Show releases')
const controlStatus = append(labelStatus, 'select') as HTMLSelectElement
for (const option of c.statusOptions) {
  const element = append(controlStatus, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlStatus.addEventListener('change', (): void => update({ status: controlStatus.value }))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Release \u2192 end of support')
const chartHost0 = append(panel0, 'div')
const component00 = new Timeline({
  id: c.id,
  x: c.start,
  lineDuration: c.duration,
  lineRow: c.row,
  color: c.color,
  lineWidth: 12,
  showRowLabels: true,
  rowHeight: 38,
  rowLabelWidth: 100,
  rowLabelTextAlign: 'left',
  lineCap: true,
  pattern: c.pattern,
})
const component01 = new Plotline({ axis: 'x', value: c.snapshot, labelText: '19 Oct 2026', labelPosition: view.labelPosition })
const component02 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const axis00 = new Axis({ type: 'x', tickFormat: c.yearLabel, numTicks: 8 })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 430,
  duration: 600,
  xDomain: c.domain,
  components: [component00, component01],
  tooltip: component02,
  xAxis: axis00,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlStatus.value = state.status
  chart0.updateContainer({ ...chart0.config, height: 430, duration: 600, xDomain: c.domain }, true)
  component00.setConfig({
    id: c.id,
    x: c.start,
    lineDuration: c.duration,
    lineRow: c.row,
    color: c.color,
    lineWidth: 12,
    showRowLabels: true,
    rowHeight: 38,
    rowLabelWidth: 100,
    rowLabelTextAlign: 'left',
    lineCap: true,
    pattern: c.pattern,
  })
  component00.setData(view.data)
  component01.setConfig({ axis: 'x', value: c.snapshot, labelText: '19 Oct 2026', labelPosition: view.labelPosition })
  component02.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  axis00.setConfig({ type: 'x', tickFormat: c.yearLabel, numTicks: 8 })
  chart0.render()
}

render()
