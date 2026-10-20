import { BulletLegend, NestedDonut, SingleContainer, Tooltip } from '@unovis/ts'
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
const labelEra = append(controls, 'label', 'gallery-select', 'Discovery period')
const controlEra = append(labelEra, 'select') as HTMLSelectElement
for (const option of c.eraOptions) {
  const element = append(controlEra, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlEra.addEventListener('change', (): void => update({ era: controlEra.value }))
const legend = new BulletLegend(append(root, 'div'), { items: view.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Discovery method \u2192 facility')
const chartHost0 = append(panel0, 'div')
const component00 = new NestedDonut({
  layers: view.layers,
  value: c.value,
  direction: 'outwards',
  centralLabel: view.centralLabel,
  centralSubLabel: view.centralSubLabel,
  segmentColor: view.segmentColor,
  layerSettings: c.layerSettings,
  sort: c.sort,
  events: view.events,
  showBackground: true,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 500, duration: 600, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: view.legend })
  controlEra.value = state.era
  chart0.updateContainer({ ...chart0.config, height: 500, duration: 600 }, true)
  component00.setConfig({
    layers: view.layers,
    value: c.value,
    direction: 'outwards',
    centralLabel: view.centralLabel,
    centralSubLabel: view.centralSubLabel,
    segmentColor: view.segmentColor,
    layerSettings: c.layerSettings,
    sort: c.sort,
    events: view.events,
    showBackground: true,
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
