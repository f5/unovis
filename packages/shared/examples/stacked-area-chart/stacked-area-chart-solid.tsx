import { JSX } from 'solid-js'
import { VisArea, VisAxis, VisXYContainer, VisXYLabels } from '@unovis/solid'

import { data, formats, DataRecord, getLabels } from './data'

const StackedAreaChart = (): JSX.Element => {
  const labels = getLabels(data)

  const x = (d: DataRecord) => d.year
  const y = formats.map((g) => (d: DataRecord) => d[g])
  const labelProps = {
    x: (d: DataRecord) => (labels[d.year] ? d.year : undefined),
    y: (d: DataRecord) => labels[d.year]?.value,
    label: (d: DataRecord) => labels[d.year]?.label,
    backgroundColor: (d: DataRecord) => labels[d.year]?.color ?? 'none',
  }

  return (
    <VisXYContainer data={data} height='50dvh'>
      <VisArea x={x} y={y} />
      <VisAxis
        type='x'
        label='Year'
        numTicks={10}
        gridLine={false}
        domainLine={false}
      />
      <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10} />
      <VisXYLabels
        {...labelProps}
        clusterBackgroundColor='none'
        clusterLabel={() => ''}
      />
    </VisXYContainer>
  )
}

export default StackedAreaChart
