import React, { useCallback } from 'react'
import { VisXYContainer, VisAxis, VisArea, VisXYLabels, VisCrosshair, VisTooltip, VisBulletLegend } from '@unovis/react'
import { data, formats, DataRecord, getLabels, gradients, legendItems, svgDefs, tooltipTemplate } from './data'

const labels = getLabels(data)
const x = (d: DataRecord): number => d.year
const y = formats.map(f => (d: DataRecord): number => d[f])
const color = (_: DataRecord[], i: number): string => gradients[i]

export default function StackedArea (): JSX.Element {
  return (
    <>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer data={data} height={'50vh'} svgDefs={svgDefs}>
        <VisArea x={x} y={y} color={color}/>
        <VisAxis type='x' label='Year' numTicks={10} gridLine={false} domainLine={false}/>
        <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10}/>
        <VisXYLabels
          x={useCallback((d: DataRecord) => labels[d.year] ? d.year : undefined, [])}
          y={useCallback((d: DataRecord) => labels[d.year]?.value, [])}
          label={useCallback((d: DataRecord) => labels[d.year]?.label, [])}
          backgroundColor={useCallback((d: DataRecord) => labels[d.year]?.color ?? 'none', [])}
          clusterBackgroundColor="none"
          clusterLabel={() => ''}
        />
        <VisCrosshair x={x} yStacked={y} template={tooltipTemplate}/>
        <VisTooltip/>
      </VisXYContainer>
    </>
  )
}
