import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { setContainerRenderBudget } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisLine } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Many Charts At Once'
export const subTitle = 'Render scheduling benchmark'

type Datum = { x: number; y: number }

const CHART_COUNT_OPTIONS = [25, 50, 100, 200]
const RENDER_BUDGET_OPTIONS = [0, 4, 8, 16]
const DEFAULT_RENDER_BUDGET = 8
const POINTS_PER_CHART = 40

function generateData (seed: number): Datum[] {
  return Array(POINTS_PER_CHART).fill(0).map((_, i) => ({
    x: i,
    y: 50 + 30 * Math.sin((i + seed) / 5) + 10 * Math.cos((i + seed * 3) / 3),
  }))
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [chartCount, setChartCount] = useState(100)
  const [renderBudget, setRenderBudget] = useState(DEFAULT_RENDER_BUDGET)
  // Changing the key remounts every chart, which is what makes this a repeatable benchmark
  const [mountKey, setMountKey] = useState(0)

  // The budget is process-global, so it has to be put back when leaving the example
  useEffect(() => () => setContainerRenderBudget(DEFAULT_RENDER_BUDGET), [])

  const data = useMemo(
    () => Array(chartCount).fill(0).map((_, i) => generateData(i)),
    [chartCount]
  )

  const remount = useCallback((budget: number, count: number) => {
    setContainerRenderBudget(budget)
    setRenderBudget(budget)
    setChartCount(count)
    setMountKey(k => k + 1)
  }, [])

  // Styles
  const controlsStyle = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 } as const
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 } as const
  const chartStyle = { height: 120 } as const

  return (
    <div>
      <p>
        Mounts many charts at once to measure how the shared render scheduler spreads the work across
        frames. Record a performance profile while pressing <b>Remount</b>: with a budget of{' '}
        <code>8</code> ms the charts paint progressively, with <code>0</code> they all render in a
        single frame, which is the behaviour before the scheduler existed.
      </p>
      <div style={controlsStyle}>
        <label>
          Charts:{' '}
          <select value={chartCount} onChange={e => remount(renderBudget, +e.target.value)}>
            {CHART_COUNT_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>
          Render budget:{' '}
          <select value={renderBudget} onChange={e => remount(+e.target.value, chartCount)}>
            {RENDER_BUDGET_OPTIONS.map(ms => (
              <option key={ms} value={ms}>{ms === 0 ? '0 ms (no splitting)' : `${ms} ms`}</option>
            ))}
          </select>
        </label>
        <button onClick={() => remount(renderBudget, chartCount)}>Remount</button>
      </div>
      <div style={gridStyle}>
        {data.map((d, i) => (
          <VisXYContainer<Datum> key={`${mountKey}-${i}`} data={d} height={chartStyle.height}>
            <VisLine x={(datum: Datum) => datum.x} y={(datum: Datum) => datum.y} duration={props.duration}/>
            <VisAxis type='x' numTicks={3}/>
            <VisAxis type='y' numTicks={3}/>
          </VisXYContainer>
        ))}
      </div>
    </div>
  )
}
