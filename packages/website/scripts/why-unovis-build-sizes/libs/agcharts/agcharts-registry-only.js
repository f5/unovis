// Context probe (not a chart): imports nothing but ModuleRegistry, registers no modules and creates
// no chart. Shows how much of ag-charts-community a bundler keeps before any chart code is used.
import { ModuleRegistry } from 'ag-charts-community'

// eslint-disable-next-line no-console
console.log(ModuleRegistry)
