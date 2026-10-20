import { BulletLegend, SingleContainer, Tooltip, Treemap } from '@unovis/ts'
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
const labelBorough = append(controls, 'label', 'gallery-select', 'Borough')
const controlBorough = append(labelBorough, 'select') as HTMLSelectElement
for (const option of c.boroughOptions) {
  const element = append(controlBorough, 'option', '', option.label) as HTMLOptionElement
  element.value = option.value
}
controlBorough.addEventListener('change', (): void => update({ borough: controlBorough.value }))
const labelQuery = append(controls, 'label', '', 'Find a species')
const controlQuery = append(labelQuery, 'input') as HTMLInputElement
controlQuery.type = 'search'
controlQuery.addEventListener('input', (): void => update({ query: controlQuery.value }))
const legend = new BulletLegend(append(root, 'div'), { items: [] })
const summary = append(root, 'p', 'gallery-summary')
summary.setAttribute('aria-live', 'polite')

const panel0 = append(root, 'div', 'gallery-panel')
append(panel0, 'p', 'gallery-caption', 'Living trees \u00b7 borough \u2192 species')
const chartHost0 = append(panel0, 'div')
const component00 = new Treemap({
  value: c.value,
  layers: c.layers,
  numberFormat: c.compact,
  tilePadding: 3,
  tilePaddingTop: 22,
  labelInternalNodes: true,
  enableTileLabelFontSizeVariation: true,
  tileLabelMediumFontSize: c.tileLabelMediumFontSize,
  tileLabelLargeFontSize: c.tileLabelLargeFontSize,
  showTileClickAffordance: true,
  events: view.events,
  attributes: view.attributes,
  tileColor: view.tileColor,
  tileSort: c.tileSort,
  enableLightnessVariance: true,
  minTileSizeForLabel: 20,
})
const component01 = new Tooltip({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
const chart0 = new SingleContainer<any>(chartHost0, { height: 460, duration: 600, svgDefs: c.svgDefs, component: component00, tooltip: component01 })

render = (): void => {
  view = c.getView(state, update)
  summary.textContent = view.summary
  legend.setConfig({ items: [] })
  controlBorough.value = state.borough
  controlQuery.value = state.query
  chart0.updateContainer({ ...chart0.config, height: 460, duration: 600, svgDefs: c.svgDefs }, true)
  component00.setConfig({
    value: c.value,
    layers: c.layers,
    numberFormat: c.compact,
    tilePadding: 3,
    tilePaddingTop: 22,
    labelInternalNodes: true,
    enableTileLabelFontSizeVariation: true,
    tileLabelMediumFontSize: c.tileLabelMediumFontSize,
    tileLabelLargeFontSize: c.tileLabelLargeFontSize,
    showTileClickAffordance: true,
    events: view.events,
    attributes: view.attributes,
    tileColor: view.tileColor,
    tileSort: c.tileSort,
    enableLightnessVariance: true,
    minTileSizeForLabel: 20,
  })
  component00.setData(view.data)
  component01.setConfig({ className: c.tooltipClassName, container: c.tooltipContainer, triggers: c.tooltipTriggers })
  chart0.setData(view.data, true)
  chart0.render()
}

render()
