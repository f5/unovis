import { BulletLegend, Sankey, SingleContainer, Tooltip } from '@unovis/ts'
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

let view = c.getView(state, update)

const controls = append(root, 'div', 'gallery-controls')
const labelFocus = append(controls, 'label', 'gallery-select', 'Focus')
const controlFocus = append(labelFocus, 'select') as HTMLSelectElement
for (const option of c.focusOptions) {
  const element = append(controlFocus, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlFocus.addEventListener('change', (): void => update({ focus: controlFocus.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Primary sources \u2192 electricity conversion \u2192 end uses')
const chartHost0 = append(panel0, 'div')
const component00 = new Sankey({
  nodeColor: c.nodeColor,
  linkColor: c.linkColor,
  subLabel: c.subLabel,
  nodePadding: 18,
  nodeWidth: 12,
  labelMaxWidth: 150,
  labelFit: c.FitMode.Wrap,
  labelForceWordBreak: false,
  nodeAlign: c.SankeyNodeAlign.Left,
  events: view.events,
  label: c.nodeLabel,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 560, duration: 600, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlFocus.value = state.focus
  chart0.updateContainer({ ...chart0.config, height: 560, duration: 600 }, true)
  component00.setConfig({
    nodeColor: c.nodeColor,
    linkColor: c.linkColor,
    subLabel: c.subLabel,
    nodePadding: 18,
    nodeWidth: 12,
    labelMaxWidth: 150,
    labelFit: c.FitMode.Wrap,
    labelForceWordBreak: false,
    nodeAlign: c.SankeyNodeAlign.Left,
    events: view.events,
    label: c.nodeLabel,
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
