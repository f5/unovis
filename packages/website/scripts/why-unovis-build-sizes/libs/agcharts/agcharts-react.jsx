// AG Charts Community via ag-charts-react. AG Charts 14 requires module registration (AgCharts.create
// throws "No modules have been registered" otherwise); only the modules this chart uses are registered.
// The tooltip is built into the chart core (there is no tooltip module).
import { createRoot } from 'react-dom/client'
import { AgCharts } from 'ag-charts-react'
import { ModuleRegistry, LineSeriesModule, CategoryAxisModule, NumberAxisModule, LegendModule } from 'ag-charts-community'
import { DATA, SERIES, getContainer } from '../shared/data.js'

ModuleRegistry.registerModules([LineSeriesModule, CategoryAxisModule, NumberAxisModule, LegendModule])

const options = {
  data: DATA,
  series: SERIES.map((s) => ({ type: 'line', xKey: 'x', yKey: s.key, yName: s.label, stroke: s.color, marker: { fill: s.color, stroke: s.color } })),
  legend: { enabled: true },
  tooltip: { mode: 'shared' },
}

function Chart () {
  return <AgCharts options={options} style={{ height: 300 }} />
}

createRoot(getContainer()).render(<Chart />)
