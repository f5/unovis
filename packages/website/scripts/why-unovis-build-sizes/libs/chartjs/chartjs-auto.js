// Reference (not tree-shaken): Chart.js "auto" entry, which registers every controller, element, scale and plugin.
import Chart from 'chart.js/auto'
import { DATA, SERIES, getContainer } from '../shared/data.js'
import { crosshair } from './crosshair-plugin.js'

const wrapper = document.createElement('div')
wrapper.style.height = '300px'
const canvas = document.createElement('canvas')
wrapper.append(canvas)
getContainer().append(wrapper)

// eslint-disable-next-line no-new
new Chart(canvas, {
  type: 'line',
  data: {
    labels: DATA.map((d) => d.x),
    datasets: SERIES.map((s) => ({ label: s.label, data: DATA.map((d) => d[s.key]), borderColor: s.color, backgroundColor: s.color, cubicInterpolationMode: 'monotone' })),
  },
  options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } },
  plugins: [crosshair],
})
