// Chart.js via react-chartjs-2, tree-shaken. react-chartjs-2's <Line> registers LineController
// itself; everything else the chart uses is registered explicitly (react-chartjs-2 docs pattern).
import { createRoot } from 'react-dom/client'
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DATA, SERIES, getContainer } from '../shared/data.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const data = {
  labels: DATA.map((d) => d.x),
  datasets: SERIES.map((s) => ({ label: s.label, data: DATA.map((d) => d[s.key]), borderColor: s.color, backgroundColor: s.color })),
}
const options = { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false } }

function Chart () {
  return (
    <div style={{ height: 300 }}>
      <Line data={data} options={options} />
    </div>
  )
}

createRoot(getContainer()).render(<Chart />)
