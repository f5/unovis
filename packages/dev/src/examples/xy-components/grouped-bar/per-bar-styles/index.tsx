import React, { useMemo, useState } from 'react'
import { VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Per-Bar Styles'
export const subTitle = 'Custom styles via `barStyle`'

type Rec = { x: number; y: number; y1: number }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [currentMonth, setCurrentMonth] = useState(6)
  const data = useMemo<Rec[]>(() => Array.from({ length: 12 }, (_, i) => ({
    x: i + 1,
    y: 6 + 4 * Math.sin(i / 2) + (i % 3),
    y1: 2 + (i % 4),
  })), [])

  // Bars after the current month are projections: dashed outline, translucent fill
  const projectedStyle = {
    strokeDasharray: '4 3',
    strokeWidth: 1,
    fillOpacity: 0.2,
  }

  return (
    <div>
      <button onClick={() => setCurrentMonth(m => Math.max(1, m - 1))}>−1 month</button>
      <button onClick={() => setCurrentMonth(m => Math.min(12, m + 1))}>+1 month</button>
      <span style={{ marginLeft: 10 }}>current month: {currentMonth}</span>
      <VisXYContainer<Rec> data={data} height={300}>
        <VisGroupedBar<Rec>
          x={d => d.x}
          y={[d => d.y, d => d.y1]}
          id={d => String(d.x)}
          dataStep={1}
          barStyle={(d, i) => (d.x > currentMonth
            ? { ...projectedStyle, stroke: `var(--vis-color${i})` }
            : undefined)}
          duration={props.duration}
        />
        <VisAxis type='x' numTicks={12} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </div>
  )
}
