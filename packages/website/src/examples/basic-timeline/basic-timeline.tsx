import React, { useCallback } from 'react'
import { Timeline } from '@volterra/vis'
import { VisXYContainer, VisBulletLegend, VisTooltip, VisTimeline, VisAxis } from '@volterra/vis-react'

import { colorMap, data, DataRecord, ProductType } from './data'

const labelWidth = 220
const dateFormatter = Intl.DateTimeFormat().format

export default function BasicTimeline (): JSX.Element {
  const legendItems = Object.keys(ProductType).map((name) => ({ name, color: colorMap[name] }))

  function getTooltipText (_: string, i: number): string {
    const { startDate, endDate, description } = data[i]
    return `
      <div style="width:${labelWidth}px">
        ${[startDate, endDate].map(dateFormatter).join(' - ')}
        ${description}
      </div>`
  }

  return (
    <VisXYContainer data={data} height={500}>
      <h3>A Timeline of Abandoned Google Products, 1997 - 2022</h3>
      <VisBulletLegend items={legendItems}/>
      <VisTimeline
        x={useCallback((d: DataRecord) => d.startDate, [])}
        length={useCallback((d: DataRecord) => d.endDate - d.startDate, [])}
        type={useCallback((d: DataRecord) => d.name, [])}
        color={useCallback((d: DataRecord) => colorMap[d.type], [])}
        labelWidth={labelWidth}
        showLabels={true}
      />
      <VisTooltip triggers={{
        [Timeline.selectors.label]: getTooltipText,
      }}/>
      <VisAxis type="x" tickFormat={dateFormatter} numTicks={10}/>
    </VisXYContainer>
  )
}
