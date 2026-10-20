import { BulletLegend, ChordDiagram, SingleContainer, Tooltip } from '@unovis/ts'
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
const labelSelected = append(controls, 'label', 'gallery-select', 'Highlight a state')
const controlSelected = append(labelSelected, 'select') as HTMLSelectElement
for (const option of c.stateOptions) {
  const element = append(controlSelected, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlSelected.addEventListener('change', (): void => update({ selected: controlSelected.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Interstate movers \u00b7 origin \u2192 destination')
const chartHost0 = append(panel0, 'div')
const component00 = new ChordDiagram({
  nodeLabel: c.nodeLabel,
  nodeColor: c.nodeColor,
  linkColor: c.linkColor,
  nodeLabelAlignment: c.ChordLabelAlignment.Along,
  nodeWidth: 28,
  highlightedNodeId: view.highlightedNodeId,
  highlightedLinkIds: view.highlightedLinkIds,
  events: view.events,
  padAngle: 0.045,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 530, duration: 600, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlSelected.value = state.selected
  chart0.updateContainer({ ...chart0.config, height: 530, duration: 600 }, true)
  component00.setConfig({
    nodeLabel: c.nodeLabel,
    nodeColor: c.nodeColor,
    linkColor: c.linkColor,
    nodeLabelAlignment: c.ChordLabelAlignment.Along,
    nodeWidth: 28,
    highlightedNodeId: view.highlightedNodeId,
    highlightedLinkIds: view.highlightedLinkIds,
    events: view.events,
    padAngle: 0.045,
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
