import React, { useCallback, useState } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'

import { DataRecord, generateData, DEFAULT_NUM_POINTS, DEFAULT_LINE_WIDTH, THICK_LINE_WIDTH } from './data'

// Reactivity smoke test: the data and lineWidth props live on the <VisLine> child
// (not the container), so clicking the controls exercises child-level data and
// config updates — the path that must trigger a chart re-render.
export default function DataReactivity (): JSX.Element {
  const [numPoints, setNumPoints] = useState(DEFAULT_NUM_POINTS)
  const [seed, setSeed] = useState(0)
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH)
  const data = generateData(numPoints, seed)

  return (
    <div>
      <div className="controls">
        <button onClick={() => setNumPoints(n => n + 1)}>Add point ({numPoints})</button>
        <button onClick={() => setSeed(s => s + 1)}>Shuffle</button>
        <button onClick={() => setLineWidth(w => (w === DEFAULT_LINE_WIDTH ? THICK_LINE_WIDTH : DEFAULT_LINE_WIDTH))}>Toggle width</button>
        <button onClick={() => setNumPoints(0)}>Clear</button>
        <button onClick={() => { setNumPoints(DEFAULT_NUM_POINTS); setSeed(0); setLineWidth(DEFAULT_LINE_WIDTH) }}>Reset</button>
      </div>
      <VisXYContainer height={200} duration={0}>
        <VisLine
          data={data}
          x={useCallback((d: DataRecord) => d.x, [])}
          y={useCallback((d: DataRecord) => d.y, [])}
          lineWidth={lineWidth}
        />
        <VisAxis type="x" />
        <VisAxis type="y" />
      </VisXYContainer>
    </div>
  )
}
