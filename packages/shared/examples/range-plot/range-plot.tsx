import React, { useCallback, useMemo } from 'react'
import { Scale, Scatter } from '@unovis/ts'
import { VisXYContainer, VisBulletLegend, VisTooltip, VisAxis, VisScatter, VisLine } from '@unovis/react'

import { data, DataRecord, processLineData } from './data'

const height = 1600
const yScale = Scale.scalePoint([0, 800]).domain(data.map(d => d.occupation))
const lineData = useMemo(() => processLineData(data), [])

export default function RangePlot (): JSX.Element {
  const legendItems = [{ name: 'Women', color: '#FF6B7E' }, { name: 'Men', color: '#4D8CFD' }]
  const tooltipTriggers = useMemo(() =>
    ({
      [Scatter.selectors.point]: (d: DataRecord) => `
      Women average pay: $${Intl.NumberFormat().format(d.women)} </br>
      Men average pay: $${Intl.NumberFormat().format(d.men)} </br>
      Pay gap: $${Intl.NumberFormat().format(d.gap)}</br>
    `,
    }), [])

  return (
    <>
      <h2>Gender Pay Gap</h2>
      <VisBulletLegend items={legendItems}/>
      <VisXYContainer height={height}>
        <VisLine
          data={lineData}
          x={useCallback((d: DataRecord) => d.x, [])}
          y={useCallback((d: DataRecord) => yScale(d.y), [])}
          color={'grey'}
        />
        <VisScatter
          data={data}
          x={useCallback((d: DataRecord) => d.men, [])}
          y={useCallback((d: DataRecord) => yScale(d.occupation), [])}
          tickFormat={useCallback((d: DataRecord) => d.men, [])}
          color={'#4D8CFD'}
          size={10}
        ></VisScatter>
        <VisScatter
          data={data}
          x={useCallback((d: DataRecord) => d.women, [])}
          y={useCallback((d: DataRecord) => yScale(d.occupation), [])}
          color={'#FF6B7E'}
          size={10}
        ></VisScatter>

        <VisAxis type='x' numTicks={5} label={'Yearly Salary'} />
        <VisAxis type='y' tickFormat={useCallback((_, i: number) => data[i].occupation, [])} numTicks={data.length} gridLine={false} />
        <VisTooltip triggers={tooltipTriggers}/>
      </VisXYContainer>
    </>
  )
}
