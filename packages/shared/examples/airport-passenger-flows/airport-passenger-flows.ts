import { Axis, BulletLegend, SingleContainer, StackedBar, Tooltip, TopoJSONMap, XYContainer } from '@unovis/ts'
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
const labelHub = append(controls, 'label', 'gallery-select', 'Origin airport')
const controlHub = append(labelHub, 'select') as HTMLSelectElement
for (const option of c.hubOptions) {
  const element = append(controlHub, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlHub.addEventListener('change', (): void => update({ hub: controlHub.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const routeLayout = append(root, 'div', 'gallery-route-layout')
const panel0 = append(routeLayout, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Passengers from the selected hub')
const chartHost0 = append(panel0, 'div')
const component00 = new TopoJSONMap({
  topojson: c.usa,
  mapFeatureName: 'states',
  projection: view.projection,
  disableZoom: true,
  pointId: c.id,
  pointBottomLabel: c.pointLabel,
  pointRadius: c.radius,
  pointColor: 'var(--vis-color0)',
  linkSource: c.linkSource,
  linkTarget: c.linkTarget,
  linkWidth: c.linkWidth,
  linkColor: 'var(--vis-color0)',
  sourceLatitude: c.sourceLatitude,
  sourceLongitude: c.sourceLongitude,
  targetLatitude: c.targetLatitude,
  targetLongitude: c.targetLongitude,
  flowParticleDensity: view.density,
  flowParticleColor: 'var(--vis-color1)',
  flowParticleRadius: 1.6,
  enableFlowAnimation: true,
  latitude: c.latitude,
  longitude: c.longitude,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 470, duration: 600, component: component00, tooltip: component01 })

const panel1 = append(routeLayout, 'div', 'gallery-panel')
routeLayout.insertBefore(panel1, panel0)
append(panel1, 'p', 'gallery-caption', 'Busiest destinations \u00b7 passengers')
const chartHost1 = append(panel1, 'div')
const component10 = new StackedBar({ x: c.rank, y: c.passengers, orientation: 'horizontal', color: 'var(--vis-color0)', barPadding: 0.25 })
const axis10 = new Axis({ type: 'x', numTicks: 3, tickFormat: c.compact, label: 'Passengers' })
const axis11 = new Axis({ type: 'y', tickValues: c.rankTicks, tickFormat: view.destinationLabel, gridLine: false })
const chart1 = new XYContainer<any>(chartHost1, {
  height: 470,
  duration: 600,
  yDirection: 'south',
  components: [component10],
  xAxis: axis10,
  yAxis: axis11,
})

render = (): void => {
  view = c.getView(state)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlHub.value = state.hub
  chart0.updateContainer({ ...chart0.config, height: 470, duration: 600 }, true)
  component00.setConfig({
    topojson: c.usa,
    mapFeatureName: 'states',
    projection: view.projection,
    disableZoom: true,
    pointId: c.id,
    pointBottomLabel: c.pointLabel,
    pointRadius: c.radius,
    pointColor: 'var(--vis-color0)',
    linkSource: c.linkSource,
    linkTarget: c.linkTarget,
    linkWidth: c.linkWidth,
    linkColor: 'var(--vis-color0)',
    sourceLatitude: c.sourceLatitude,
    sourceLongitude: c.sourceLongitude,
    targetLatitude: c.targetLatitude,
    targetLongitude: c.targetLongitude,
    flowParticleDensity: view.density,
    flowParticleColor: 'var(--vis-color1)',
    flowParticleRadius: 1.6,
    enableFlowAnimation: true,
    latitude: c.latitude,
    longitude: c.longitude,
  })
  component00.setData(view.mapData)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.mapData, true)
  chart0.render()
  chart1.updateContainer({ ...chart1.config, height: 470, duration: 600, yDirection: 'south' }, true)
  component10.setConfig({ x: c.rank, y: c.passengers, orientation: 'horizontal', color: 'var(--vis-color0)', barPadding: 0.25 })
  component10.setData(view.data)
  axis10.setConfig({ type: 'x', numTicks: 3, tickFormat: c.compact, label: 'Passengers' })
  axis11.setConfig({ type: 'y', tickValues: c.rankTicks, tickFormat: view.destinationLabel, gridLine: false })
  chart1.render()
}

render()
