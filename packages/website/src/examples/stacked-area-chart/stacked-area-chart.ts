import { Area, Axis, XYContainer, XYLabels } from '@unovis/ts'
import { data, formats, DataRecord, getLabels } from './data'

const labels = getLabels(data)

const container = document.getElementById('vis-container')

const chart = new XYContainer(container, {
  height: 500,
  components: [
    // area chart
    new Area<DataRecord>({
      x: (d: DataRecord) => d.year,
      y: formats.map(f => (d: DataRecord) => d[f]),
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
  xAxis: new Axis({ label: 'Year', numTicks: 10, domainLine: false, gridLine: false }),
  yAxis: new Axis({ label: 'Revenue (USD, billions)', numTicks: 10 }),
}, data)
