import { Axis, BulletLegend, Crosshair, GroupedBar, Line, Plotline, Tooltip, XYContainer } from '@unovis/ts'
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
const labelLimit = append(controls, 'label', 'gallery-select', 'Visible duration')
const controlLimit = append(labelLimit, 'select') as HTMLSelectElement
for (const option of c.limitOptions) {
  const element = append(controlLimit, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlLimit.addEventListener('change', (): void => update({ limit: controlLimit.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Trip-duration histogram \u00b7 share of rides')
const chartHost0 = append(panel0, 'div')
const component00 = new GroupedBar({ x: c.minute, y: c.share, color: 'var(--vis-color0)', groupPadding: 0.05 })
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.histogramTooltipTriggers })
const axis00 = new Axis({ type: 'x', label: 'Duration (minutes)' })
const axis01 = new Axis({ type: 'y', tickFormat: c.percent, label: 'Share of rides' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 270,
  duration: 600,
  xDomain: view.domain,
  components: [component00],
  tooltip: component01,
  xAxis: axis00,
  yAxis: axis01,
})

const panel1 = append(root, 'div', 'gallery-panel')
append(panel1, 'p', 'gallery-caption', 'Cumulative share \u00b7 rides shorter than each bin edge')
const chartHost1 = append(panel1, 'div')
const component10 = new Line({ x: c.edge, y: c.cumulative, color: 'var(--vis-color1)', curveType: c.CurveType.StepAfter })
const component11 = new Plotline({ value: 0.5, labelText: '50% of rides', labelPosition: c.PlotlineLabelPosition.TopLeft })
const component12 = new Crosshair({ template: c.cumulativeTooltip })
const component13 = new Tooltip({ className: c.tooltipClassName })
const axis10 = new Axis({ type: 'x', label: 'Duration (minutes)' })
const axis11 = new Axis({ type: 'y', tickFormat: c.percent, label: 'Cumulative share' })
const chart1 = new XYContainer<any>(chartHost1, {
  height: 240,
  duration: 600,
  xDomain: view.domain,
  yDomain: c.cumulativeDomain,
  components: [component10, component11],
  crosshair: component12,
  tooltip: component13,
  xAxis: axis10,
  yAxis: axis11,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlRider.value = state.rider
  controlLimit.value = state.limit
  chart0.updateContainer({ ...chart0.config, height: 270, duration: 600, xDomain: view.domain }, true)
  component00.setConfig({ x: c.minute, y: c.share, color: 'var(--vis-color0)', groupPadding: 0.05 })
  component00.setData(view.histogram)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.histogramTooltipTriggers })
  axis00.setConfig({ type: 'x', label: 'Duration (minutes)' })
  axis01.setConfig({ type: 'y', tickFormat: c.percent, label: 'Share of rides' })
  chart0.render()
  chart1.updateContainer({ ...chart1.config, height: 240, duration: 600, xDomain: view.domain, yDomain: c.cumulativeDomain }, true)
  component10.setConfig({ x: c.edge, y: c.cumulative, color: 'var(--vis-color1)', curveType: c.CurveType.StepAfter })
  component10.setData(view.cumulative)
  component11.setConfig({ value: 0.5, labelText: '50% of rides', labelPosition: c.PlotlineLabelPosition.TopLeft })
  component12.setConfig({ template: c.cumulativeTooltip })
  component12.setData(view.cumulative)
  component13.setConfig({ className: c.tooltipClassName })
  axis10.setConfig({ type: 'x', label: 'Duration (minutes)' })
  axis11.setConfig({ type: 'y', tickFormat: c.percent, label: 'Cumulative share' })
  chart1.render()
}

render()
