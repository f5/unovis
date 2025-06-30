import { Axis, Line, Area, Scatter, XYContainer, Crosshair, Tooltip } from '@unovis/ts'
import { data1, data2, data3, DataRecord } from './data'

// Create the main container
const container = document.getElementById('vis-container')

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

// Create tooltip
const tooltip = new Tooltip({ container: document.body })

// Create separate crosshair instances for each chart
const crosshair1 = new Crosshair<DataRecord>({
  syncId: 'demo-sync',
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

const crosshair2 = new Crosshair<DataRecord>({
  syncId: 'demo-sync',
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

const crosshair3 = new Crosshair<DataRecord>({
  syncId: 'demo-sync',
  template: (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`,
})

// Create charts
const chart1 = new XYContainer(chart1Div, {
  components: [line],
  crosshair: crosshair1,
  tooltip: tooltip,
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data1)

const chart2 = new XYContainer(chart2Div, {
  components: [area],
  crosshair: crosshair2,
  tooltip: tooltip,
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data2)

const chart3 = new XYContainer(chart3Div, {
  components: [scatter],
  crosshair: crosshair3,
  tooltip: tooltip,
  xAxis: new Axis(),
  yAxis: new Axis(),
}, data3)

// Add instruction text
const instructionDiv = document.createElement('div')
instructionDiv.innerHTML = 'Hover over any chart to see synchronized crosshairs across all three charts'
instructionDiv.style.fontSize = '14px'
instructionDiv.style.color = '#666'
instructionDiv.style.textAlign = 'center'
instructionDiv.style.marginTop = '10px'
container.appendChild(instructionDiv)
