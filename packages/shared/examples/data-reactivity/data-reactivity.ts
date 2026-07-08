import { Axis, Line, XYContainer } from '@unovis/ts'
import { DataRecord, generateData, DEFAULT_NUM_POINTS, DEFAULT_LINE_WIDTH, THICK_LINE_WIDTH } from './data'

// Reactivity smoke test: the buttons call `setData` / `setConfig` on the Line
// component and re-render, mirroring what the framework wrappers do internally.
const container = document.getElementById('vis-container')

let numPoints = DEFAULT_NUM_POINTS
let seed = 0
let lineWidth = DEFAULT_LINE_WIDTH

const line = new Line<DataRecord>({ x: d => d.x, y: d => d.y, lineWidth })
const chart = new XYContainer<DataRecord>(container, {
  height: 200,
  duration: 0,
  components: [line],
  xAxis: new Axis(),
  yAxis: new Axis(),
}, generateData(numPoints, seed))

function update (): void {
  line.setConfig({ x: d => d.x, y: d => d.y, lineWidth })
  line.setData(generateData(numPoints, seed))
  chart.render()
}

const controls = document.createElement('div')
controls.className = 'controls'
const buttons: [string, () => void][] = [
  ['Add point', () => { numPoints += 1 }],
  ['Shuffle', () => { seed += 1 }],
  ['Toggle width', () => { lineWidth = lineWidth === DEFAULT_LINE_WIDTH ? THICK_LINE_WIDTH : DEFAULT_LINE_WIDTH }],
  ['Clear', () => { numPoints = 0 }],
  ['Reset', () => { numPoints = DEFAULT_NUM_POINTS; seed = 0; lineWidth = DEFAULT_LINE_WIDTH }],
]
for (const [label, action] of buttons) {
  const button = document.createElement('button')
  button.textContent = label
  button.addEventListener('click', () => { action(); update() })
  controls.appendChild(button)
}
container.parentElement?.insertBefore(controls, container)
