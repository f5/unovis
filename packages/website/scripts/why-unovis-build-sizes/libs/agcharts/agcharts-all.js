// Reference (not tree-shaken): AG Charts Community with AllCommunityModule registered.
import { AgCharts, ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import { DATA, SERIES, getContainer } from '../shared/data.js'

ModuleRegistry.registerModules([AllCommunityModule])

const element = document.createElement('div')
element.style.height = '300px'
getContainer().append(element)

AgCharts.create({
  container: element,
  data: DATA,
  series: SERIES.map((s) => ({ type: 'line', xKey: 'x', yKey: s.key, yName: s.label, stroke: s.color, marker: { fill: s.color, stroke: s.color } })),
  legend: { enabled: true },
  tooltip: { mode: 'shared' },
})
