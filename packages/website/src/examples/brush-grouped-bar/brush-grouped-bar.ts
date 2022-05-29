import { XYContainer, Axis, GroupedBar, BulletLegend, Brush, BulletLegendItemInterface } from '@volterra/vis'
import { data, groups, GroupItem, DataRecord } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem
const items: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

const container = document.getElementById('#vis-container')

// shared bar chart config
const barConfig = {
  x: (d: DataRecord) => d.year,
  y: items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key]),
  roundedCorners: true,
  barMinHeight: 0,
  groupPadding: 0.2,
}

// legend
const legend = new BulletLegend(container, { items })

// main chart
const chart = new XYContainer<DataRecord>(container, {
  height: 500,
  components: [new GroupedBar(barConfig)],
  xAxis: new Axis({ label: 'Year' }),
  yAxis: new Axis({ label: 'Cereal Production (metric tons, millions)' }),
}, data)

// callback for legend item clicks
function onLegendItemClick (item: LegendItem, i: number): void {
  item.inactive = !item.inactive
  items[i] = item
  chart.updateComponents([{
    ...barConfig,
    y: items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key]),
  }])
  legend.render()
}
legend.update({ items, onLegendItemClick })

// brush/navigation chart
const brushChart = new XYContainer<DataRecord>(container, {
  height: 75,
  margin: { top: 20 },
  components: [
    new GroupedBar(barConfig),
    new Brush<DataRecord>({
      draggable: true,
      selection: [1980, 1990],
      onBrush: (selection: [number, number]) => {
        chart.updateContainer({
          ...chart.config,
          xDomain: selection,
        })
      },
    }),
  ],
  xAxis: new Axis(),
}, data)
