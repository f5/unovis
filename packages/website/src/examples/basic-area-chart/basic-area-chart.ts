import { Area, Axis, BulletLegend, NumericAccessor, XYContainer } from '@unovis/ts'
import { countries, Country, data, DataRecord } from './data'

const container = document.getElementById('vis-container')

// Accesor functions
const x = (_: DataRecord, i: number): number => i
const accessors = (id: Country): { y: NumericAccessor<DataRecord>; color: string } => ({
  y: (d: DataRecord) => d.cases[id],
  color: countries[id].color,
})
const xTicks = (i: number): string => `${data[i].month} ${data[i].year}`
const yTicks = Intl.NumberFormat(navigator.language, { notation: 'compact' }).format

// Legend
const legend = new BulletLegend(container, { items: Object.values(countries) })

// Chart
const chart = new XYContainer(container, {
  height: 400,
  components: [
    new Area<DataRecord>({ x, opacity: 0.7, ...accessors(Country.UnitedStates) }),
    new Area<DataRecord>({ x, opacity: 0.6, ...accessors(Country.India) }),
  ],
  xAxis: new Axis({ tickFormat: xTicks }),
  yAxis: new Axis({ tickFormat: yTicks }),
}, data)
