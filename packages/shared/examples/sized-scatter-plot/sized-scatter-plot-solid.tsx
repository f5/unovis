import { JSX } from 'solid-js'
import { Position, Scale, Scatter } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/solid'

import { data, DataRecord, palette } from './data'

const SizeScatterPlot = (): JSX.Element => {
  const categories = [
    ...new Set(data.map((d: DataRecord) => d.category)),
  ].sort()
  const colorScale = Scale.scaleOrdinal(palette).domain(categories)
  const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

  // scatter props
  const x = (d: DataRecord) => d.medianSalary
  const y = (d: DataRecord) => d.employmentRate
  const color = (d: DataRecord) => colorScale(d.category)
  const size = (d: DataRecord) => d.total
  const label = (d: DataRecord) => formatNumber(d.total)

  const legendItems = categories.map((v) => ({ name: v, color: colorScale(v) }))
  const triggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
    `,
  }

  return (
    <div>
      <h2>American College Graduates, 2010-2012</h2>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer data={data} height='50dvh' scaleByDomain>
        <VisScatter
          x={x}
          y={y}
          color={color}
          size={size}
          label={label}
          labelPosition={Position.Bottom}
          sizeRange={[10, 50]}
          cursor='pointer'
        />
        <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber} />
        <VisAxis
          excludeFromDomainCalculation
          type='y'
          label='Employment Rate'
          tickPadding={0}
        />
        <VisTooltip triggers={triggers} />
      </VisXYContainer>
    </div>
  )
}

export default SizeScatterPlot
