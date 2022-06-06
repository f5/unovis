import { Area, Axis, XYContainer, XYLabels } from '@volterra/vis'
import { data, formats, DataRecord, getMaxItems } from './data'

type Label = {
  color: string;
  label: string;
  value: number;
}

function configureLabels (): Record<number, Label> {
  // map formats to their maximum data records
  const peakItems = getMaxItems(data.slice(0, data.length - 2), formats)

  // place labels at [x,y] where x = peak year and y = area midpoint
  return formats.reduce((obj, k, i) => {
    const offset = Array(i).fill(0).reduce((sum, _, j) => sum + peakItems[k][formats[j]], 0)
    const [x, y] = [peakItems[k].year, offset + peakItems[k][k] / 2]
    obj[x] = { label: k === 'cd' ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1), value: y, color: `var(--vis-color${i}` }
    return obj
  }, {})
}

const container = document.getElementById('#vis-container')
const labelItems = configureLabels()

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
      x: (d: DataRecord) => labelItems[d.year] ? d.year : undefined,
      y: (d: DataRecord) => labelItems[d.year]?.value,
      label: (d: DataRecord) => labelItems[d.year]?.label ?? '',
      backgroundColor: (d: DataRecord) => labelItems[d.year]?.color,
      clusterBackgroundColor: 'none',
      clusterLabel: () => '',
    }),
  ],
  xAxis: new Axis({ label: 'Year', domainLine: false, gridLine: false }),
  yAxis: new Axis({ label: 'Revenue (USD, billions)', numTicks: 10 }),
}, data)
