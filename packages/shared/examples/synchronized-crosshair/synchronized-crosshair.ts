import { Axis, Line, Area, Scatter, XYContainer, Crosshair, Tooltip, Position } from '@unovis/ts'
import { data1, data2, data3, DataRecord } from './data'

// Create the main container
const container = document.getElementById('vis-container')
const height = 450
// Check if container exists
if (!container) {
  throw new Error('Container not found')
}

// Create three divs inside the container
const chart1Div = document.createElement('div')
const chart2Div = document.createElement('div')
const chart3Div = document.createElement('div')

// Add titles and styling
chart1Div.innerHTML = '<h4>Line Chart</h4>'
chart2Div.innerHTML = '<h4>Area Chart</h4>'
chart3Div.innerHTML = '<h4>Scatter Plot</h4>'

// Style the container and divs
container.style.display = 'flex'
container.style.flexDirection = 'column'
container.style.gap = '20px'

chart1Div.style.marginBottom = '10px'
chart2Div.style.marginBottom = '10px'
chart3Div.style.marginBottom = '10px'

// Append divs to container
container.appendChild(chart1Div)
container.appendChild(chart2Div)
container.appendChild(chart3Div)

// Create components
const line = new Line<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const area = new Area<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

const scatter = new Scatter<DataRecord>({
  x: d => d.x,
  y: d => d.y,
})

// Create tooltips for each chart
const tooltip1 = new Tooltip({ verticalShift: height, horizontalPlacement: Position.Center })
const tooltip2 = new Tooltip({ verticalShift: height, horizontalPlacement: Position.Center })
const tooltip3 = new Tooltip({ verticalShift: height, horizontalPlacement: Position.Center })

// Create separate crosshair instances for each chart
const crosshair1 = new Crosshair<DataRecord>({
  x: d => d.x,
  y: d => d.y,
  tooltip: tooltip1,
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

const crosshair2 = new Crosshair<DataRecord>({
  x: d => d.x,
  y: d => d.y,
  tooltip: tooltip2,
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

const crosshair3 = new Crosshair<DataRecord>({
  x: d => d.x,
  y: d => d.y,
  tooltip: tooltip3,
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

// State management for synchronization
let syncXPosition: number | Date | undefined
let activeChart: 'chart1' | 'chart2' | 'chart3' | null = null
let isUpdatingSync = false // Flag to prevent recursive calls

const updateChartSync = (): void => {
  isUpdatingSync = true

  // Update chart 1
  crosshair1.config.xPosition = activeChart !== 'chart1' ? syncXPosition : undefined
  crosshair1.config.forceShow = activeChart !== 'chart1' && !!syncXPosition
  if (activeChart === null) {
    crosshair1.hide()
  } else {
    crosshair1._render()
  }

  // Update chart 2
  crosshair2.config.xPosition = activeChart !== 'chart2' ? syncXPosition : undefined
  crosshair2.config.forceShow = activeChart !== 'chart2' && !!syncXPosition
  if (activeChart === null) {
    crosshair2.hide()
  } else {
    crosshair2._render()
  }

  // Update chart 3
  crosshair3.config.xPosition = activeChart !== 'chart3' ? syncXPosition : undefined
  crosshair3.config.forceShow = activeChart !== 'chart3' && !!syncXPosition
  if (activeChart === null) {
    crosshair3.hide()
  } else {
    crosshair3._render()
  }

  isUpdatingSync = false
}

const onCrosshairMove = (x: number | Date | undefined, chartId: 'chart1' | 'chart2' | 'chart3'): void => {
  if (isUpdatingSync) return // Prevent recursive calls

  syncXPosition = x
  activeChart = x === undefined ? null : chartId

  // Update all charts with new sync state
  updateChartSync()
}

// Add onCrosshairMove callbacks after crosshairs are defined
crosshair1.config.onCrosshairMove = (x) => onCrosshairMove(x, 'chart1')
crosshair2.config.onCrosshairMove = (x) => onCrosshairMove(x, 'chart2')
crosshair3.config.onCrosshairMove = (x) => onCrosshairMove(x, 'chart3')

// Create charts
const chart1 = new XYContainer(chart1Div, {
  components: [line],
  crosshair: crosshair1,
  tooltip: tooltip1,
  xAxis: new Axis<DataRecord>(),
  yAxis: new Axis<DataRecord>(),
  margin: { top: 5, left: 5 },
}, data1)

const chart2 = new XYContainer(chart2Div, {
  components: [area],
  crosshair: crosshair2,
  tooltip: tooltip2,
  xAxis: new Axis<DataRecord>(),
  yAxis: new Axis<DataRecord>(),
  margin: { top: 5, left: 5 },
}, data2)

const chart3 = new XYContainer(chart3Div, {
  components: [scatter],
  crosshair: crosshair3,
  tooltip: tooltip3,
  xAxis: new Axis<DataRecord>(),
  yAxis: new Axis<DataRecord>(),
  margin: { top: 5, left: 5 },
}, data3)

// Add instruction text
const instructionDiv = document.createElement('div')
instructionDiv.innerHTML = 'Hover over any chart to see synchronized crosshairs across all three charts'
instructionDiv.style.fontSize = '14px'
instructionDiv.style.color = '#666'
instructionDiv.style.textAlign = 'center'
instructionDiv.style.marginTop = '10px'
container.appendChild(instructionDiv)
