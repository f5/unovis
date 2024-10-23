import { JSX } from 'solid-js'
import { NumericAccessor, StringAccessor } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisScatter, VisXYContainer } from '@unovis/solid'

import { data, DataRecord } from './data'

const BasicScatterPlot = (): JSX.Element => {
  const legendItems = [
    { name: 'Male', color: '#1fc3aa' },
    { name: 'Female', color: '#8624F5' },
    { name: 'No Data', color: '#aaa' },
  ]

  const x: NumericAccessor<DataRecord> = (d) => d.beakLength
  const y: NumericAccessor<DataRecord> = (d) => d.flipperLength
  const color: StringAccessor<DataRecord> = (d) =>
    legendItems.find((i) => i.name === (d.sex ?? 'No Data'))?.color

  return (
    <div>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer data={data} height='50dvh'>
        <VisScatter x={x} y={y} color={color} size={8} />
        <VisAxis type='x' label='Beak Length (mm)' />
        <VisAxis type='y' label='Flipper Length (mm)' />
      </VisXYContainer>
    </div>
  )
}

export default BasicScatterPlot
