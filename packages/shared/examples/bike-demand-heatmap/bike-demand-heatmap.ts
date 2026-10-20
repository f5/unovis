import { RollingPinLegend, Heatmap, SingleContainer, Tooltip } from '@unovis/ts'
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
const labelRider = append(controls, 'label', 'gallery-select', 'Riders')
const controlRider = append(labelRider, 'select') as HTMLSelectElement
for (const option of c.riderOptions) {
  const element = append(controlRider, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlRider.addEventListener('change', (): void => update({ rider: controlRider.value }))
const legend = new RollingPinLegend(append(root, 'div'), { rects: c.colorRange, leftLabelText: '0', rightLabelText: view.maxLabel })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Average trip starts \u00b7 weekday \u00d7 hour')
const chartHost0 = append(panel0, 'div')
const component00 = new Heatmap({
  value: c.value,
  numRows: 7,
  colorRange: c.colorRange,
  colorDomain: view.colorDomain,
  rowLabel: c.weekdayLabel,
  columnLabel: c.hourLabel,
  cellPadding: 3,
  cellCornerRadius: 3,
  cursor: 'pointer',
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 330, duration: 600, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ rects: c.colorRange, leftLabelText: '0', rightLabelText: view.maxLabel })
  controlRider.value = state.rider
  chart0.updateContainer({ ...chart0.config, height: 330, duration: 600 }, true)
  component00.setConfig({
    value: c.value,
    numRows: 7,
    colorRange: c.colorRange,
    colorDomain: view.colorDomain,
    rowLabel: c.weekdayLabel,
    columnLabel: c.hourLabel,
    cellPadding: 3,
    cellCornerRadius: 3,
    cursor: 'pointer',
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
