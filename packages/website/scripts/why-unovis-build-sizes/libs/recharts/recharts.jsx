// Recharts (React only). `responsive` is a runtime prop in Recharts 3.x; its ResizeObserver code
// ships in every Recharts chart whether or not the prop is used, so it does not change the bundle.
import { createRoot } from 'react-dom/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { DATA, SERIES, getContainer } from '../shared/data.js'

function Chart () {
  return (
    <LineChart data={DATA} responsive style={{ width: '100%', height: 300 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" />
      <YAxis />
      <Tooltip />
      <Legend />
      {SERIES.map((s) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} />)}
    </LineChart>
  )
}

createRoot(getContainer()).render(<Chart />)
