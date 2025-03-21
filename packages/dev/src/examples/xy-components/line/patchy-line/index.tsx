import React, { useState } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisScatter, VisCrosshair, VisTooltip, VisAnnotations } from '@unovis/react'
import { CurveType } from '@unovis/ts'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer'

import s from './style.module.css'

export const title = 'Patchy Line Chart'
export const subTitle = 'Various test cases'

type TestCase = {
  title: string;
  data: (number | undefined | null)[];
}

const testCases: TestCase[] = [
  { title: 'Gaps in middle', data: [3, 1, undefined, 7, undefined, 1, 1, undefined, 0.5, 4] },
  { title: 'Longer gaps', data: [2, 3, undefined, undefined, undefined, 12, 10, undefined, undefined, 2] },
  { title: 'Gaps at ends', data: [7, undefined, 9, 10, 7, 4, 5, 2, undefined, 10] },
  { title: 'Gaps at true ends', data: [undefined, 2, 10, 4, 5, 2, 6, 2, 3, undefined] },
  { title: 'Gaps surrounding single point', data: [5, 3, 6, undefined, 2, undefined, 10, 8, 9, 5] },
  { title: 'All undefined', data: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined] },
  { title: 'Single point', data: [undefined, undefined, undefined, undefined, 10, undefined] },
  { title: 'Missing every other point', data: [3, undefined, 12, undefined, 7, undefined, 5, undefined, 12] },
  { title: 'Includes undefined and null values', data: [3, 5, undefined, 6, 7, null, 9, 10, undefined, 4] },

]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  type Datum = Record<string, number>
  const combined = Array.from({ length: 10 }, (_, i) => ({
    x: i,
    ...(testCases.reduce((obj, d, j) => ({
      ...obj,
      [`y${j}`]: d.data[i],
    }), {})),
  }))
  const x = (d: Datum): number => d.x
  const getY = (i: number) => (d: Datum) => d[`y${i}`]

  const fallbacks = [undefined, 0, 5, 10]
  const [fallbackValue, setFallbackValue] = useState(fallbacks[0])
  const [interpolation, setInterpolation] = useState(true)
  const [showScatter, setShowScatter] = useState(true)

  return (
    <div className={s.patchyLineExample}>
      <div className={s.inputs}>
        <label>
          Fallback value:
          <select onChange={e => setFallbackValue(fallbacks[Number(e.target.value)])}>
            {fallbacks.map((o, i) => <option value={i}>{String(o)}</option>)}
          </select>
        </label>
        <label>
          Interpolate:<input type='checkbox' checked={interpolation} onChange={e => setInterpolation(e.target.checked)}/>
        </label>
        <label>
          Show Scatter: <input type='checkbox' checked={showScatter} onChange={e => setShowScatter(e.target.checked)}/>
        </label>
      </div>
      <div className={s.singleLines}>
        {testCases.map((val, i) => (
          <VisXYContainer<Datum> data={combined} key={i} xDomain={[-0.2, 9.2]} yDomain={[0, 15]} height={200} width='100%'>
            <VisAnnotations items={[{ content: val.title, x: '50%', y: 0, textAlign: 'center' }]}/>
            <VisLine
              curveType={CurveType.Linear}
              duration={props.duration}
              fallbackValue={fallbackValue}
              interpolateMissingData={interpolation}
              x={x}
              y={getY(i)}
            />
            {showScatter && <VisScatter excludeFromDomainCalculation size={2} x={x} y={d => getY(i)(d) ?? undefined}/>}
            <VisCrosshair template={(d: Datum) => `${d.x}, ${getY(i)(d)}`} color='var(--vis-color0)' strokeWidth='1px'/>
            <VisTooltip/>
            <VisAxis type='x'/>
            <VisAxis type='y' domainLine={false}/>
          </VisXYContainer>
        ))}
      </div>
    </div>
  )
}
