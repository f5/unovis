import React, { useCallback } from 'react'
import { VisXYContainer, VisAxis, VisArea, VisXYLabels } from '@volterra/vis-react'
import { data, formats, DataRecord } from './data'

type Label = {
  color: string;
  label: string;
  value: number;
}

// map formats to their maximum data records
const peakItems = data.slice(0, data.length - 2).reduce((obj, d) => {
  formats.forEach(k => {
    obj[k] = d[k] > obj[k][k] ? d : obj[k]
  })
  return obj
}, Object.fromEntries(formats.map(k => [k, data[0]])))

// place labels at [x,y] where x = peak year and y = area midpoint
const labelItems: Record<number, Label> = formats.reduce((obj, k, i) => {
  const offset = Array(i).fill(0).reduce((sum, _, j) => sum + peakItems[k][formats[j]], 0)
  const [x, y] = [peakItems[k].year, offset + peakItems[k][k] / 2]
  obj[x] = { label: k === 'cd' ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1), value: y, color: `var(--vis-color${i}` }
  return obj
}, {})

export default function BasicArea (): JSX.Element {
  return (
    <>
      <VisXYContainer data={data} height={500}>
        <VisArea x={useCallback((d: DataRecord) => d.year, [])} y={formats.map(g => useCallback((d: DataRecord) => d[g], []))}/>
        <VisAxis type='x' label='Year' gridLine={false} domainLine={false}/>
        <VisAxis type='y' label='Revenue (USD, billions)' numTicks={10}/>
        <VisXYLabels
          x={useCallback((d: DataRecord) => labelItems[d.year] ? d.year : undefined, [])}
          y={useCallback((d: DataRecord) => labelItems[d.year]?.value, [])}
          label={useCallback((d: DataRecord) => labelItems[d.year]?.label, [])}
          backgroundColor={useCallback((d: DataRecord) => labelItems[d.year]?.color ?? 'none', [])}
          clusterBackgroundColor="none"
          clusterLabel={() => ''}
        />
      </VisXYContainer>
    </>
  )
}
