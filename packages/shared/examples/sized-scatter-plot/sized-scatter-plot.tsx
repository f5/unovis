import React, { useCallback } from 'react'
import { Position, Scale, Scatter } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/react'
import { data, DataRecord, palette } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = (value: number): string => Intl.NumberFormat('en', { notation: 'compact' }).format(value)

export default function SizedScatterPlot (): JSX.Element {
  const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  const tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      ${d.major}<br/>Number of graduates: ${d.total.toLocaleString()}
    `,
  }
  return (
    <>
      <h2>American College Graduates, 2010-2012</h2>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer data={data} height={'60vh'} scaleByDomain={true}>
        <VisScatter
          x={useCallback((d: DataRecord) => d.medianSalary, [])}
          y={useCallback((d: DataRecord) => d.employmentRate, [])}
          color={useCallback((d: DataRecord) => colorScale(d.category), [])}
          size={useCallback((d: DataRecord) => d.total, [])}
          label={useCallback((d: DataRecord) => formatNumber(d.total), [])}
          labelPosition={Position.Bottom}
          sizeRange={[10, 50]}
          cursor='pointer'
        />
        <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber}/>
        <VisAxis excludeFromDomainCalculation type='y' label='Employment Rate' tickPadding={0}/>
        <VisTooltip triggers={tooltipTriggers}/>
      </VisXYContainer>
    </>
  )
}
