import { Axis, BulletLegend, Timeline, Tooltip, XYContainer, colors } from '@volterra/vis'
import { colorMap, data, DataRecord, ProductType } from './data'

const labelWidth = 220
const dateFormatter = Intl.DateTimeFormat().format

const container = document.getElementById('#vis-container')
container.innerHTML = '<h3>A Timeline of Abandoned Google Products, 1997 - 2022</h3>'

const legend = new BulletLegend(container, {
  items: Object.keys(ProductType).map((name, i) => ({ name, color: colorMap[name] })),
})

const timeline = new Timeline<DataRecord>({
  x: (d: DataRecord) => d.startDate,
  length: (d: DataRecord) => d.endDate - d.startDate,
  type: (d: DataRecord) => d.name,
  color: (d: DataRecord) => colorMap[d.type],
  labelWidth,
  showLabels: true,
})

const chart = new XYContainer(container, {
  height: 500,
  components: [timeline],
  tooltip: new Tooltip({
    triggers: {
      [Timeline.selectors.label]: (_: string, i: number) => {
        const { startDate, endDate, description } = data[i]
        return `
          <div style="width:${labelWidth}px">
            ${[startDate, endDate].map(dateFormatter).join(' - ')}
            ${description}
          </div>`
      },
    },
  }),
  xAxis: new Axis({ tickFormat: dateFormatter, numTicks: 10 }),
}, data)
