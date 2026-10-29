import { Area, Axis, Brush, BulletLegend, Crosshair, Line, Tooltip, XYContainer } from '@unovis/ts'
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

const controls = append(root, 'div', 'gallery-controls electricity-grid-controls')
const labelAuthority = append(controls, 'label', '', 'Grid area')
const controlAuthority = append(labelAuthority, 'select') as HTMLSelectElement
for (const option of c.authorityOptions) {
  const element = append(controlAuthority, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlAuthority.addEventListener('change', (): void => update({ authority: controlAuthority.value }))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Generation by fuel \u00b7 GW')
const chartHost0 = append(panel0, 'div')
const component00 = new Area({ x: c.time, y: c.fuelAccessors, color: c.fuelColors, curveType: c.CurveType.StepAfter, minHeight: 1, stackMinHeight: true })
const component01 = new Crosshair({ forceShowAt: state.cursor, onCrosshairMove: view.onMove, template: c.generationTooltip })
const component02 = new Tooltip({ container: c.tooltipContainer })
const axis00 = new Axis({ type: 'x', label: 'Time (UTC)', tickFormat: c.dayLabel, numTicks: 7 })
const axis01 = new Axis({ type: 'y', label: 'Generation (GW)' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 260,
  duration: 600,
  xDomain: state.domain,
  margin: c.chartMargin,
  autoMargin: false,
  components: [component00],
  crosshair: component01,
  tooltip: component02,
  xAxis: axis00,
  yAxis: axis01,
})

const panel1 = append(root, 'div', 'gallery-panel')
append(panel1, 'p', 'gallery-caption', 'Actual and day-ahead forecast demand \u00b7 GW')
const chartHost1 = append(panel1, 'div')
const component10 = new Line({ x: c.time, y: c.demandAccessors, color: c.demandColors, curveType: c.CurveType.Linear })
const component11 = new Crosshair({ forceShowAt: state.cursor, onCrosshairMove: view.onMove, template: c.demandTooltip })
const component12 = new Tooltip({})
const axis10 = new Axis({ type: 'x', label: 'Time (UTC)', tickFormat: c.dayLabel, numTicks: 7 })
const axis11 = new Axis({ type: 'y', label: 'Demand (GW)' })
const chart1 = new XYContainer<any>(chartHost1, {
  height: 190,
  duration: 600,
  xDomain: state.domain,
  margin: c.chartMargin,
  autoMargin: false,
  components: [component10],
  crosshair: component11,
  tooltip: component12,
  xAxis: axis10,
  yAxis: axis11,
})

const panel2 = append(root, 'div', 'gallery-panel')
append(panel2, 'p', 'gallery-caption', 'Drag to select a time window')
const chartHost2 = append(panel2, 'div')
const component20 = new Line({ x: c.time, y: c.demand, color: 'var(--vis-color0)', lineWidth: 1 })
const component21 = new Brush({ draggable: true, selection: state.domain, onBrush: view.onBrush })
const axis20 = new Axis({ type: 'x', tickFormat: c.dayLabel, numTicks: 7 })
const chart2 = new XYContainer<any>(chartHost2, {
  height: 75,
  duration: 600,
  margin: c.chartMargin,
  autoMargin: false,
  components: [component20, component21],
  xAxis: axis20,
})

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  controlAuthority.value = state.authority
  chart0.updateContainer({ ...chart0.config, height: 260, duration: 600, xDomain: state.domain, margin: c.chartMargin, autoMargin: false }, true)
  component00.setConfig({ x: c.time, y: c.fuelAccessors, color: c.fuelColors, curveType: c.CurveType.StepAfter, minHeight: 1, stackMinHeight: true })
  component00.setData(view.data)
  component01.setConfig({ forceShowAt: state.cursor, onCrosshairMove: view.onMove, template: c.generationTooltip })
  component01.setData(view.data)
  component02.setConfig({ container: c.tooltipContainer })
  axis00.setConfig({ type: 'x', label: 'Time (UTC)', tickFormat: c.dayLabel, numTicks: 7 })
  axis01.setConfig({ type: 'y', label: 'Generation (GW)' })
  chart0.render()
  chart1.updateContainer({ ...chart1.config, height: 190, duration: 600, xDomain: state.domain, margin: c.chartMargin, autoMargin: false }, true)
  component10.setConfig({ x: c.time, y: c.demandAccessors, color: c.demandColors, curveType: c.CurveType.Linear })
  component10.setData(view.data)
  component11.setConfig({ forceShowAt: state.cursor, onCrosshairMove: view.onMove, template: c.demandTooltip })
  component11.setData(view.data)
  component12.setConfig({})
  axis10.setConfig({ type: 'x', label: 'Time (UTC)', tickFormat: c.dayLabel, numTicks: 7 })
  axis11.setConfig({ type: 'y', label: 'Demand (GW)' })
  chart1.render()
  chart2.updateContainer({ ...chart2.config, height: 75, duration: 600, margin: c.chartMargin, autoMargin: false }, true)
  component20.setConfig({ x: c.time, y: c.demand, color: 'var(--vis-color0)', lineWidth: 1 })
  component20.setData(view.data)
  component21.setConfig({ draggable: true, selection: state.domain, onBrush: view.onBrush })
  component21.setData(view.data)
  axis20.setConfig({ type: 'x', tickFormat: c.dayLabel, numTicks: 7 })
  chart2.render()
}

render()
