import { XYContainer, Line, Scale, Scatter, Axis, BulletLegend, Tooltip } from '@unovis/ts'
import { data, DataRecord, processLineData, LineDataRecord } from './data'

const height = 1600
const container = document.getElementById('vis-container')
const legendItems = [{ name: 'Women', color: '#FF6B7E' }, { name: 'Men', color: '#4D8CFD' }]

const legend = new BulletLegend(container, {
  items: legendItems,
})
const yScale = Scale.scalePoint([0, 800]).domain(data.map(d => d.occupation))
const lineData = processLineData(data)


// Area
const scatterWomen = new Scatter<DataRecord>({
  x: (d: DataRecord) => d.women,
  y: (d: DataRecord) => yScale(d.occupation),
  color: '#4D8CFD',
  size: 10,
  color: '#FF6B7E',
})

scatterWomen.setData(data)

const scatterMen = new Scatter<DataRecord>({
  x: (d: DataRecord) => d.men,
  y: (d: DataRecord) => yScale(d.occupation),
  color: '#4D8CFD',
  size: 10,
})
scatterMen.setData(data)


const line = new Line<LineDataRecord>({
  x: (d: LineDataRecord) => d.x,
  y: (d: LineDataRecord) => yScale(d.y),
  color: 'grey',
})
line.setData(lineData)

// Container
const chart = new XYContainer(container, {
  height: height,
  components: [line, scatterWomen, scatterMen],
  xAxis: new Axis({ label: 'Yearly Salary' }),
  yAxis: new Axis({
    tickFormat: (_, i: number) => data[i].occupation,
    numTicks: data.length,
    gridLine: false,
  }),
  tooltip: new Tooltip({
    triggers: {
      [Scatter.selectors.point]: (d: DataRecord) => `
      Women average pay: $${Intl.NumberFormat().format(d.women)} </br>
      Men average pay: $${Intl.NumberFormat().format(d.men)} </br>
      Pay gap: $${Intl.NumberFormat().format(d.gap)}</br>
    `,
    },
  }),
})

