import React, { useCallback, useMemo } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisBulletLegend } from '@unovis/react'
import { CurveType } from '@unovis/ts'

import { data, candidates, DataRecord } from './data'

import './styles.css'

export default function StepAreaChart (): JSX.Element {
  const [curr, setCurr] = React.useState(candidates[0].name)
  const items = useMemo(() => candidates.map(c => ({ ...c, inactive: curr !== c.name })), [curr])
  return (<>
    <div className="panel">
      <VisBulletLegend items={Object.keys(data[0][curr]).map(d => ({ name: d }))}/>
      <div className='legendSwitch'>
        <VisBulletLegend items={items} onLegendItemClick={(i) => setCurr(i.name)}/>
      </div>
    </div>
    <VisXYContainer data={data} height={400} yDomain={[0, 42]}>
      <VisArea
        x={useCallback((d: DataRecord) => d.year, [])}
        y={[
          useCallback((d: DataRecord) => d[curr].neutral, [curr]),
          useCallback((d: DataRecord) => d[curr].negative, [curr]),
          useCallback((d: DataRecord) => d[curr].positive, [curr]),
        ]}
        curveType={CurveType.Step}
      />
      <VisAxis type="x" label="Month"/>
      <VisAxis type="y" label="Number of Mentions"/>
    </VisXYContainer>
  </>)
}
