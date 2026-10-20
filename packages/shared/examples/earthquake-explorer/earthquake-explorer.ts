import { Axis, BulletLegend, Scatter, SingleContainer, StackedBar, Tooltip, TopoJSONMap, XYContainer } from '@unovis/ts'
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
const labelMinimum = append(controls, 'label', 'gallery-select', 'Minimum magnitude')
const controlMinimum = append(labelMinimum, 'select') as HTMLSelectElement
for (const option of c.magnitudeOptions) {
  const element = append(controlMinimum, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlMinimum.addEventListener('change', (): void => update({ minimum: controlMinimum.value }))
const labelHalf = append(controls, 'label', 'gallery-select', 'Dates')
const controlHalf = append(labelHalf, 'select') as HTMLSelectElement
for (const option of c.dateOptions) {
  const element = append(controlHalf, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlHalf.addEventListener('change', (): void => update({ half: controlHalf.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Epicenters \u00b7 click a point to select')
const chartHost0 = append(panel0, 'div')
const component00 = new TopoJSONMap({
  topojson: c.world,
  pointId: c.id,
  pointRadius: view.pointRadius,
  pointColor: view.pointColor,
  pointStrokeWidth: 1,
  events: view.mapEvents,
  disableZoom: true,
  latitude: c.latitude,
  longitude: c.longitude,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.mapTooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 300, duration: 600, component: component00, tooltip: component01 })

const panel1 = append(root, 'div', 'gallery-panel')
append(panel1, 'p', 'gallery-caption', 'Depth and magnitude \u00b7 click a point to select')
const chartHost1 = append(panel1, 'div')
const component10 = new Scatter({ x: c.depth, y: c.magnitude, size: view.pointSize, color: view.pointColor, events: view.scatterEvents })
const component11 = new Tooltip({ className: c.tooltipClassName, triggers: c.scatterTooltipTriggers })
const axis10 = new Axis({ type: 'x', label: 'Depth (km)' })
const axis11 = new Axis({ type: 'y', label: 'Magnitude' })
const chart1 = new XYContainer<any>(chartHost1, {
  height: 230,
  margin: c.chartMargin,
  autoMargin: false,
  duration: 600,
  components: [component10],
  tooltip: component11,
  xAxis: axis10,
  yAxis: axis11,
})

const panel2 = append(root, 'div', 'gallery-panel')
append(panel2, 'p', 'gallery-caption', 'Daily event counts \u00b7 UTC')
const chartHost2 = append(panel2, 'div')
const component20 = new StackedBar({ x: c.day, y: c.count, color: 'var(--vis-color0)', barPadding: 0.2 })
const axis20 = new Axis({ type: 'x', tickFormat: c.dayLabel, numTicks: 8 })
const axis21 = new Axis({ type: 'y', numTicks: 3 })
const chart2 = new XYContainer<any>(chartHost2, { height: 140, duration: 600, margin: c.chartMargin, autoMargin: false, components: [component20], xAxis: axis20, yAxis: axis21 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlMinimum.value = state.minimum
  controlHalf.value = state.half
  chart0.updateContainer({ ...chart0.config, height: 300, duration: 600 }, true)
  component00.setConfig({
    topojson: c.world,
    pointId: c.id,
    pointRadius: view.pointRadius,
    pointColor: view.pointColor,
    pointStrokeWidth: 1,
    events: view.mapEvents,
    disableZoom: true,
    latitude: c.latitude,
    longitude: c.longitude,
  })
  component00.setData(view.mapData)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.mapTooltipTriggers })
  chart0.setData(view.mapData, true)
  chart0.render()
  chart1.updateContainer({ ...chart1.config, height: 230, duration: 600, margin: c.chartMargin, autoMargin: false }, true)
  component10.setConfig({ x: c.depth, y: c.magnitude, size: view.pointSize, color: view.pointColor, events: view.scatterEvents })
  component10.setData(view.data)
  component11.setConfig({ className: c.tooltipClassName, triggers: c.scatterTooltipTriggers })
  axis10.setConfig({ type: 'x', label: 'Depth (km)' })
  axis11.setConfig({ type: 'y', label: 'Magnitude' })
  chart1.render()
  chart2.updateContainer({ ...chart2.config, height: 140, duration: 600, margin: c.chartMargin, autoMargin: false }, true)
  component20.setConfig({ x: c.day, y: c.count, color: 'var(--vis-color0)', barPadding: 0.2 })
  component20.setData(view.daily)
  axis20.setConfig({ type: 'x', tickFormat: c.dayLabel, numTicks: 8 })
  axis21.setConfig({ type: 'y', numTicks: 3 })
  chart2.render()
}

render()
