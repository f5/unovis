import { Area, Axis, Brush, BulletLegend, Crosshair, Line, Plotline, Tooltip, XYContainer } from '@unovis/ts'
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
const reset = append(controls, 'button', '', 'Reset') as HTMLButtonElement
reset.type = 'button'
reset.addEventListener('click', (): void => update(c.initialState))
const legend = new BulletLegend(append(root, 'div'), { items: c.legend })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Sunspot number')
const chartHost0 = append(panel0, 'div')
const component00 = new Area({ x: c.time, y: c.bandHeight, baseline: c.bandBaseline, color: 'var(--vis-color1)', opacity: 0.18 })
const component01 = new Line({ x: c.time, y: c.observed, color: 'var(--vis-color0)', lineWidth: 1.4, curveType: c.CurveType.Linear })
const component02 = new Line({
  x: c.time,
  y: c.predicted,
  color: 'var(--vis-color1)',
  lineDashArray: c.forecastDash,
  curveType: c.CurveType.Linear,
})
const component03 = new Plotline({
  axis: 'x',
  value: view.forecastStart,
  labelText: 'Forecast snapshot',
  labelPosition: c.PlotlineLabelPosition.TopRight,
})
const component04 = new Crosshair({ template: c.crosshairTemplate })
const component05 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer })
const axis00 = new Axis({ type: 'x', tickFormat: c.yearLabel, numTicks: 7 })
const axis01 = new Axis({ type: 'y', label: 'Monthly sunspot number' })
const chart0 = new XYContainer<any>(chartHost0, {
  height: 420,
  duration: 600,
  xDomain: state.domain,
  components: [component00, component01, component02, component03],
  crosshair: component04,
  tooltip: component05,
  xAxis: axis00,
  yAxis: axis01,
})

const panel1 = append(root, 'div', 'gallery-panel')
append(panel1, 'p', 'gallery-caption', 'Drag the overview to explore the record')
const chartHost1 = append(panel1, 'div')
const component10 = new Line({ x: c.time, y: c.observed, lineWidth: 1, color: 'var(--vis-color0)' })
const component11 = new Brush({ draggable: true, selection: state.domain, onBrush: view.onBrush })
const axis10 = new Axis({ type: 'x', tickFormat: c.yearLabel, numTicks: 8 })
const chart1 = new XYContainer<any>(chartHost1, { height: 85, duration: 600, components: [component10, component11], xAxis: axis10 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: c.legend })
  chart0.updateContainer({ ...chart0.config, height: 420, duration: 600, xDomain: state.domain }, true)
  component00.setConfig({ x: c.time, y: c.bandHeight, baseline: c.bandBaseline, color: 'var(--vis-color1)', opacity: 0.18 })
  component00.setData(view.prediction)
  component01.setConfig({ x: c.time, y: c.observed, color: 'var(--vis-color0)', lineWidth: 1.4, curveType: c.CurveType.Linear })
  component01.setData(view.observed)
  component02.setConfig({
    x: c.time,
    y: c.predicted,
    color: 'var(--vis-color1)',
    lineDashArray: c.forecastDash,
    curveType: c.CurveType.Linear,
  })
  component02.setData(view.prediction)
  component03.setConfig({
    axis: 'x',
    value: view.forecastStart,
    labelText: 'Forecast snapshot',
    labelPosition: c.PlotlineLabelPosition.TopRight,
  })
  component04.setConfig({ template: c.crosshairTemplate })
  component04.setData(view.data)
  component05.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer })
  axis00.setConfig({ type: 'x', tickFormat: c.yearLabel, numTicks: 7 })
  axis01.setConfig({ type: 'y', label: 'Monthly sunspot number' })
  chart0.render()
  chart1.updateContainer({ ...chart1.config, height: 85, duration: 600 }, true)
  component10.setConfig({ x: c.time, y: c.observed, lineWidth: 1, color: 'var(--vis-color0)' })
  component10.setData(view.data)
  component11.setConfig({ draggable: true, selection: state.domain, onBrush: view.onBrush })
  axis10.setConfig({ type: 'x', tickFormat: c.yearLabel, numTicks: 8 })
  chart1.render()
}

render()
