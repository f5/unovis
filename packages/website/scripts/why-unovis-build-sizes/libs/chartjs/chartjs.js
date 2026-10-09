// Chart.js (vanilla), tree-shaken: register only the pieces this chart uses.
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { DATA, SERIES, getContainer } from '../shared/data.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

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
    datasets: SERIES.map((s) => ({ label: s.label, data: DATA.map((d) => d[s.key]), borderColor: s.color, backgroundColor: s.color })),
  },
  options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } },
})
