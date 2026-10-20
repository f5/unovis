import { BulletLegend, Graph, SingleContainer, Tooltip } from '@unovis/ts'
import * as c from './constants'
import './styles.css'

function append (parent: HTMLElement, tag: string, className = '', text = ''): HTMLElement {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text
  return parent.appendChild(element)
}

const host = document.getElementById('vis-container') as HTMLElement
const root = append(host, 'div', 'gallery-example dependency-explorer')
let state: c.ExampleState = { ...c.initialState }
let render = (): void => undefined

function update (patch: Partial<c.ExampleState>): void {
  state = { ...state, ...patch }
  render()
}

let view = c.getView(state, update)

const controls = append(root, 'div', 'gallery-controls')
const labelQuery = append(controls, 'label', '', 'Find a package')
const controlQuery = append(labelQuery, 'input') as HTMLInputElement
controlQuery.type = 'search'
controlQuery.addEventListener('input', (): void => update({ query: controlQuery.value }))
const labelLayout = append(controls, 'label', 'gallery-select', 'Layout')
const controlLayout = append(labelLayout, 'select') as HTMLSelectElement
for (const option of c.layoutOptions) {
  const element = append(controlLayout, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlLayout.addEventListener('change', (): void => update({ layout: controlLayout.value }))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Selected direct dependencies')
const chartHost0 = append(panel0, 'div')
const component00 = new Graph<c.NodeDatum, c.LinkDatum>({
  layoutType: state.layout,
  nodeLabel: c.nodeLabel,
  nodeSubLabel: c.nodeSubLabel,
  nodeFill: 'var(--gallery-node-fill)',
  nodeStroke: c.nodeFill,
  nodeIcon: c.nodeIcon,
  nodeIconSize: 22,
  nodeSize: 34,
  linkArrow: 'single',
  linkWidth: 1.5,
  linkCurvature: 1,
  selectedNodeId: state.selected,
  events: view.events,
  fitViewPadding: 45,
  layoutGroupOrder: c.groupOrder,
  layoutParallelNodesPerColumn: 6,
  layoutParallelNodeSpacing: c.nodeSpacing,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 500, duration: 600, svgDefs: c.svgDefs, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlQuery.value = state.query
  controlLayout.value = state.layout
  chart0.updateContainer({ ...chart0.config, height: 500, duration: 600 }, true)
  component00.setConfig({
    layoutType: state.layout,
    nodeLabel: c.nodeLabel,
    nodeSubLabel: c.nodeSubLabel,
    nodeFill: 'var(--gallery-node-fill)',
    nodeStroke: c.nodeFill,
    nodeIcon: c.nodeIcon,
    nodeIconSize: 22,
    nodeSize: 34,
    linkArrow: 'single',
    linkWidth: 1.5,
    linkCurvature: 1,
    selectedNodeId: state.selected,
    events: view.events,
    fitViewPadding: 45,
    layoutGroupOrder: c.groupOrder,
    layoutParallelNodesPerColumn: 6,
    layoutParallelNodeSpacing: c.nodeSpacing,
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
