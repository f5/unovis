import React, { useCallback } from 'react'
import { Position, Scale, Scatter, colors } from '@unovis/ts'
import { VisAxis, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/react'
import { data, DataRecord, shapes, categories, sumCategories } from './data'

const shapeScale = Scale.scaleOrdinal(shapes).domain(categories)
const colorScale = Scale.scaleOrdinal(colors).domain(categories)

export default function ShapedScatterPlot (): JSX.Element {
  const legendItems = categories.map(v => ({ name: v, shape: shapeScale(v) }))
  const tooltipTriggers = {
    [Scatter.selectors.point]: (d: DataRecord) => `
      <strong>name</strong>: ${d.name} <br>
      <strong>owner</strong>: ${d.owner} <br>
      <strong>bn parameters</strong>: ${d.trainedParam}`,
  }
  return (
    <>
      <h2>The Rise and Rise of A.I. Large Language Models</h2>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer data={data} height={'60vh'} scaleByDomain={true}>
        <VisScatter
          x={useCallback((d: DataRecord) => +(new Date(d.date)), [])}
          y={useCallback((d: DataRecord) => d.trainedParam, [])}
          shape={useCallback((d: DataRecord) => shapeScale(sumCategories(d.owner)), [])}
          size={15}
          label={useCallback((d: DataRecord) => d.name, [])}
          labelHideOverlapping={true}
          cursor='pointer'
          color={useCallback((d: DataRecord) => colorScale(sumCategories(d.owner)), [])}
        />
        <VisAxis type='x' label='Date Released'
          tickFormat={Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format}/>
        <VisAxis excludeFromDomainCalculation type='y' label='Billion Parameters' tickPadding={0}/>
        <VisTooltip triggers={tooltipTriggers}/>
      </VisXYContainer>
    </>
  )
}
