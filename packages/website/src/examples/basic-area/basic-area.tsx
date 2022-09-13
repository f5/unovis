import React, { useCallback } from 'react'
import { VisXYContainer, VisAxis, VisArea, VisXYLabels } from '@unovis/react'
import { data, formats, DataRecord, getLabels } from './data'


export default function BasicArea (): JSX.Element {
  const labels = getLabels(data)
  return (
    <>
      <VisXYContainer data={data} height={500}>
        <VisArea x={useCallback((d: DataRecord) => d.year, [])} y={formats.map(g => useCallback((d: DataRecord) => d[g], []))}/>
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
      </VisXYContainer>
    </>
  )
}
