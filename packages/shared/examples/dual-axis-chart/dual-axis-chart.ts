import { XYContainer, Area, Line, Axis } from '@unovis/ts'
import { XYDataRecord, generateXYDataRecords } from './data'
import './styles.css'

const container = document.getElementById('vis-container')
const chartAContainer = document.createElement('div')
container.appendChild(chartAContainer)

const chartBContainer = document.createElement('div')
chartBContainer.className = 'chartContainer'
container.appendChild(chartBContainer)

const margin = { left: 100, right: 100, top: 40, bottom: 60 }

// Area
const area = new Area<XYDataRecord>({
  x: (d: XYDataRecord) => d.x,
  y: (d: XYDataRecord, i: number) => i * (d.y || 0),
  opacity: 0.9,
})

const line = new Line<XYDataRecord>({
  x: (d: XYDataRecord) => d.x,
  y: (d: XYDataRecord, i: number) => 20 + 10 * (d.y2 || 0),
  color: '#FF6B7E',
})

// Container
const chartA = new XYContainer(chartAContainer, {
  height: '40vh',
  width: '100%',
  position: 'absolute',
  components: [area],
  margin: margin,
  autoMargin: false,
  xAxis: new Axis({ label: 'Time' }),
  yAxis: new Axis({
    label: 'Traffic',
    tickFormat: (y: number) => `${y}bps`,
    tickTextWidth: 60,
    tickTextColor: '#4D8CFD',
    labelColor: '#4D8CFD',
  }),
}, generateXYDataRecords(150))

const chartB = new XYContainer(chartBContainer, {
  components: [line],
  yDomain: [0, 150],
  margin: margin,
  autoMargin: false,
  yAxis: new Axis({
    position: 'right',
    tickFormat: (y: number) => `${y}db`,
    gridLine: false,
    tickTextColor: '#FF6B7E',
    labelColor: '#FF6B7E',
    label: 'Signal Strength',
  }),
}, generateXYDataRecords(150))
