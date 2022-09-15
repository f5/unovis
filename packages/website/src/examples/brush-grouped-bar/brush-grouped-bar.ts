import {
  XYContainer,
  Axis,
  GroupedBar,
  BulletLegend,
  Brush,
  BulletLegendItemInterface,
  BulletLegendConfigInterface,
  GroupedBarConfigInterface,
  XYContainerConfigInterface,
} from '@unovis/ts'
import { data, groups, GroupItem, DataRecord } from './data'

type LegendItem = BulletLegendItemInterface & GroupItem
const items: LegendItem[] = groups.map(g => ({ ...g, inactive: false }))

const container = document.getElementById('vis-container')
let chart: XYContainer<DataRecord> | null = null
let legend: BulletLegend | null = null

// Initialize the configs
// Shared config for both `GroupedBar` components
const barComponentConfig: GroupedBarConfigInterface<DataRecord> = {
  x: (d: DataRecord) => d.year,
  y: items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key]),
  roundedCorners: true,
  barMinHeight: 0,
  groupPadding: 0.2,
}

const mainChartConfig: XYContainerConfigInterface<DataRecord> = {
  height: 500,
  duration: 0,
  components: [
    new GroupedBar(barComponentConfig),
  ],
  xAxis: new Axis({ label: 'Year' }),
  yAxis: new Axis({ label: 'Cereal Production (metric tons, millions)' }),
}

const brushChartConfig: XYContainerConfigInterface<DataRecord> = {
  height: 75,
  margin: { top: 20 },
  components: [
    new GroupedBar(barComponentConfig),
    new Brush<DataRecord>({
      draggable: true,
      selection: [1980, 1990],
      onBrush: (selection: [number, number], _, userDriven) => {
        if (userDriven) {
          chart?.updateContainer({
            ...mainChartConfig,
            duration: 0, // We set duration to 0 to update the main chart immediately (without animation) after the brush event
            xDomain: selection,
          })
        }
      },
    }),
  ],
  xAxis: new Axis(),
}

const legendConfig: BulletLegendConfigInterface = {
  items,
  onLegendItemClick: (item: LegendItem, i: number) => {
    item.inactive = !item.inactive
    items[i] = item


    chart?.updateContainer({
      ...mainChartConfig,
      duration: undefined, // Enabling default animation duration for legend interactions
    })

    chart?.updateComponents([{
      ...barComponentConfig,
      y: items.map(i => (d: DataRecord) => i.inactive ? null : d[i.key]),
    }])

    legend?.render()
  },
}

// Initialize the components
// Legend
legend = new BulletLegend(container, legendConfig)

// Main chart
chart = new XYContainer<DataRecord>(container, mainChartConfig, data)

// Brush (navigation) chart
const brushChart = new XYContainer<DataRecord>(container, brushChartConfig, data)
