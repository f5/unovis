import React, { useMemo } from 'react'
import { VisXYContainer, VisStackedBar, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

const NUM_ITEMS = 100
const NUM_KEYS = 300
const SPARSITY = 0.99// 99% of values will be null

type SparseDataRecord = {
  x: number;
  [key: `y${number}`]: number | null;
}

// Generate sparse data: 100 items with 100 keys each, 90% null
function generateSparseData (seed = 42): SparseDataRecord[] {
  // Simple seeded random number generator (LCG)
  let s = seed
  const random = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }

  return Array.from({ length: NUM_ITEMS }, (_, i) => {
    const record: SparseDataRecord = { x: i }

    for (let k = 0; k < NUM_KEYS; k++) {
      // 99% chance of null, 1% chance of a value
      record[`y${k}`] = random() < SPARSITY ? null : Math.floor(random() * 100) + 1
    }

    return record
  })
}

export const title = 'Performance Test'
export const subTitle = '100 items × 300 keys (90% sparse)'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateSparseData(), [])

  const accessors = useMemo(
    () => Array.from({ length: NUM_KEYS }, (_, k) => (d: SparseDataRecord) => d[`y${k}`]),
    []
  )

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <strong>Performance Test:</strong> {NUM_ITEMS} items × {NUM_KEYS} keys ({SPARSITY * 100}% sparse)
      </div>
      <VisXYContainer<SparseDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisStackedBar x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={10} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair template={(d: SparseDataRecord) => `x: ${d.x}`}/>
        <VisTooltip/>
      </VisXYContainer>
    </>
  )
}
