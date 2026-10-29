import { Area, Axis, BulletLegend, Crosshair, Tooltip, XYContainer, XYLabels } from '@unovis/ts'
import { data, formats, DataRecord, getLabels, gradients, legendItems, svgDefs, tooltipTemplate } from './data'

const labels = getLabels(data)

const container = document.getElementById('vis-container')
const legendContainer = document.createElement('div')
const chartContainer = document.createElement('div')
container.append(legendContainer, chartContainer)

const legend = new BulletLegend(legendContainer, { items: legendItems })

const chart = new XYContainer(chartContainer, {
  height: 500,
  svgDefs,
  components: [
    // area chart
    new Area<DataRecord>({
      x: (d: DataRecord) => d.year,
      y: formats.map(f => (d: DataRecord) => d[f]),
      color: (_: DataRecord[], i: number) => gradients[i],
    }),
    // labels
    new XYLabels({
      x: (d: DataRecord) => labels[d.year] ? d.year : undefined,
      y: (d: DataRecord) => labels[d.year]?.value,
      label: (d: DataRecord) => labels[d.year]?.label ?? '',
      backgroundColor: (d: DataRecord) => labels[d.year]?.color,
      clusterBackgroundColor: 'none',
      clusterLabel: () => '',
    }),
  ],
  crosshair: new Crosshair({
    x: (d: DataRecord) => d.year,
    yStacked: formats.map(f => (d: DataRecord) => d[f]),
    template: tooltipTemplate,
  }),
  tooltip: new Tooltip(),
  xAxis: new Axis({ label: 'Year', numTicks: 10, domainLine: false, gridLine: false }),
  yAxis: new Axis({ label: 'Revenue (USD, billions)', numTicks: 10 }),
}, data)
