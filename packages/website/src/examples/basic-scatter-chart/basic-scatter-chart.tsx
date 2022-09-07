import React, { useCallback } from 'react'
import { Scale, Scatter } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisBulletLegend, VisTooltip } from '@unovis/react'
import { palette, data, DataRecord } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

export default function BasicScatterChart (): JSX.Element {
  const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  const tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
    `,
  }
  return (
    <VisXYContainer data={data} height={600} scaleByDomain={true}>
      <h2>American College Graduates, 2010-2012</h2>
      <VisScatter
        x={useCallback((d: DataRecord) => d.medianSalary, [])}
        y={useCallback((d: DataRecord) => d.employmentRate, [])}
        color={useCallback((d: DataRecord) => colorScale(d.category), [])}
        size={useCallback((d: DataRecord) => d.total, [])}
        label={useCallback((d: DataRecord) => formatNumber(d.total), [])}
        sizeRange={[10, 50]}
        cursor='pointer'
      />
      <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber}/>
      <VisAxis excludeFromDomainCalculation type='y' label='Employment Rate' tickPadding={0}/>
      <VisTooltip triggers={tooltipTriggers}/>
      <VisBulletLegend items={legendItems}/>
    </VisXYContainer>
  )
}
