import { Axis, BulletLegend, FreeBrush, FreeBrushMode, Scale, Scatter, XYContainer } from '@volterra/vis'
import { data, palette, DataRecord } from './data'

// constants/helpers
const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format
const height = 600
const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))

function add (parent: HTMLElement, tag: string, options = {}): HTMLElement {
  return parent.appendChild(Object.assign(document.createElement(tag), options))
}

// initialize title, legend and containers
const container = document.getElementById('#vis-container')
const title = add(container, 'h2', { innerText: 'American College Graduates, 2010-2012' })
const legend = new BulletLegend(container, { items: legendItems })
const vis = add(container, 'div', { classList: 'main ' })
const left = add(vis, 'div')
const right = add(vis, 'div')

// shared accessors
const accessors = {
  x: (d: DataRecord) => d.medianSalary,
  y: (d: DataRecord) => d.employmentRate,
  color: (d: DataRecord) => colorScale(d.category),
  size: (d: DataRecord) => d.total,
  label: (d: DataRecord) => d.major,
}

// configure right/main chart
const chart = new XYContainer(right, {
  height,
  components: [new Scatter({ ...accessors, sizeRange: [20, 80] })],
  xAxis: new Axis({ label: 'Median Salary ($)', tickFormat: formatNumber, gridLine: false }),
  yAxis: new Axis({ label: 'Average Employment Rate', gridLine: false }),
}, [])

// configure left/preview chart
const preview = new XYContainer(left, {
  height,
  components: [
    new Scatter(accessors),
    new FreeBrush({
      autoHide: false,
      mode: FreeBrushMode.XY,
      onBrushEnd: (s: [[number, number], [number, number]] | null) => {
        if (s) {
          chart.updateContainer({
            ...chart.config,
            xDomain: s[0],
            yDomain: s[1],
          })
        }
        chart.setData(s ? data : [])
      },
      selectionMinLength: [0, 0],
      x: accessors.x,
      y: accessors.y,
    }),
  ],
}, data)

