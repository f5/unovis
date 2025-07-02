import { CurveType, XYContainer, Line, Axis, Crosshair, Scatter, Tooltip, XYComponentCore, XYComponentConfigInterface } from '@unovis/ts'
import './styles.css'
import { countries, Country, data, DataRecord } from './data'

/**
 * fallback values for handling missing data
 */
const fallbacks = [null, undefined, 0, 2000]
let fallbackValue: number | null | undefined = fallbacks[0]
let interpolation = true
let showScatter = true
const container: HTMLElement = document.getElementById('vis-container') as HTMLElement

const getY = (c: Country) => (d: DataRecord) => d[c.id]
const xAccessor = (d: DataRecord): number => d.year
const countriesYAccessors = countries.map(getY)

// Create line component
const line = new Line<DataRecord>({
  curveType: CurveType.Linear,
  fallbackValue: fallbackValue,
  interpolateMissingData: interpolation,
  x: xAccessor,
  y: countriesYAccessors,
})

// Create crosshair component
const crosshair = new Crosshair<DataRecord>({
  color: ['var(--vis-color0)', 'var(--vis-color1)'],
  template: (d: DataRecord) =>
    `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`,
})

// Create scatter components
const scatters = countries.map((country, i) =>
  new Scatter<DataRecord>({
    size: 5,
    x: xAccessor,
    color: country.color || `var(--vis-color${i})`,
    y: (d: DataRecord) => d[country.id],
  })
)

// Create tooltip component
const tooltip = new Tooltip()

// Function to get components dynamically
function getComponents (): XYComponentCore<DataRecord, Partial<XYComponentConfigInterface<DataRecord>>>[] {
  const components: XYComponentCore<DataRecord, Partial<XYComponentConfigInterface<DataRecord>>>[] = [line]
  if (showScatter) {
    components.push(...scatters)
  }
  return components
}

const xDomain: [number, number] = [1989, 2024]
const chartDefaultConfig = {
  width: '100%',
  height: '50vh',
  tooltip,
  crosshair,
  duration: 0,
  xDomain,
  xAxis: new Axis<DataRecord>({ numTicks: 10 }),
  yAxis: new Axis<DataRecord>({
    label: 'Electric power consumption (kWh per capita)',
    tickFormat: (d: number) => `${d}${d ? 'kWh' : ''}`,
    tickValues: [100, 1000, 2000, 3000, 4000],
  }),
}

// Container with all components
const chart = new XYContainer<DataRecord>(container, {
  ...chartDefaultConfig,
  components: getComponents(),
}, data)

// Create UI controls
const controlsContainer = document.createElement('div')
controlsContainer.className = 'controls-container'
container.parentNode?.insertBefore(controlsContainer, container)

// Fallback value selector
const fallbackLabel = document.createElement('label')
fallbackLabel.textContent = 'Select a fallback value for missing data points: '

const fallbackSelect = document.createElement('select')
fallbacks.forEach((value, index) => {
  const option = document.createElement('option')
  option.value = String(index)
  option.textContent = String(value)
  fallbackSelect.appendChild(option)
})

fallbackSelect.addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement
  fallbackValue = fallbacks[Number(target.value)]
  line.setConfig({ ...line.config, fallbackValue })
  line.render()
})

fallbackLabel.appendChild(fallbackSelect)
controlsContainer.appendChild(fallbackLabel)

// Interpolation toggle
const interpolationLabel = document.createElement('label')
interpolationLabel.textContent = 'Interpolate: '

const interpolationCheckbox = document.createElement('input')
interpolationCheckbox.type = 'checkbox'
interpolationCheckbox.checked = interpolation

interpolationCheckbox.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement
  interpolation = target.checked
  line.setConfig({ ...line.config, interpolateMissingData: interpolation })
  line.render()
})

interpolationLabel.appendChild(interpolationCheckbox)
controlsContainer.appendChild(interpolationLabel)

// Scatter toggle
const scatterLabel = document.createElement('label')
scatterLabel.textContent = 'Show Scatter: '

const scatterCheckbox = document.createElement('input')
scatterCheckbox.type = 'checkbox'
scatterCheckbox.checked = showScatter

scatterCheckbox.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement
  showScatter = target.checked
  // Update the chart with new components
  chart.update({
    components: getComponents(),
    ...chartDefaultConfig,
  })
})

scatterLabel.appendChild(scatterCheckbox)
controlsContainer.appendChild(scatterLabel)
