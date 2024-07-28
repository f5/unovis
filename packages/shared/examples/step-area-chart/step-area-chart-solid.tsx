import { createMemo, createSignal, JSX } from 'solid-js'
import { VisArea, VisAxis, VisBulletLegend, VisXYContainer } from '@unovis/solid'
import { BulletLegendItemInterface, CurveType } from '@unovis/ts'

import './styles.css'

import { data, candidates, DataRecord } from './data'

const StepAreaChart = (): JSX.Element => {
  const [curr, setCurr] = createSignal(candidates[0].name)

  const keys = createMemo(() =>
    Object.keys(data[0][curr()]).map((d) => ({ name: d }))
  )
  const x = (d: DataRecord) => d.year

  function onLegendItemClick (i: BulletLegendItemInterface): void {
    setCurr(i.name as string)
  }

  const y = createMemo(() =>
    keys().map((i) => (d: DataRecord) => d[curr()][i.name])
  )
  const items = createMemo(() =>
    candidates.map((c) => ({ ...c, inactive: curr() !== c.name }))
  )

  return (
    <div class='step-area-chart'>
      <div class='panel'>
        <VisBulletLegend
          items={Object.keys(data[0][curr()]).map((d) => ({ name: d }))}
        />
        <div class='legendSwitch'>
          <VisBulletLegend
            labelClassName='legendLabel'
            items={items()}
            onLegendItemClick={onLegendItemClick}
          />
        </div>
      </div>
      <VisXYContainer data={data} height='50dvh' yDomain={[0, 42]}>
        <VisArea x={x} y={y()} curveType={CurveType.StepAfter} />
        <VisAxis type='x' label='Year' />
        <VisAxis type='y' label='Number of Mentions' />
      </VisXYContainer>
    </div>
  )
}

export default StepAreaChart
