import React, { useMemo } from 'react'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

const NUM_POINTS = 10000
const SPARSITY = 0.75 // 85% of y values will be null

type SparseScatterRecord = {
  x: number;
  y: number | null;
  size: number;
}

function generateSparseScatterData (seed = 42): SparseScatterRecord[] {
  let s = seed
  const random = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }

  return Array.from({ length: NUM_POINTS }, () => ({
    x: random() * 100,
    y: random() < SPARSITY ? null : random() * 100,
    size: 2 + random() * 8,
  }))
}

export const title = 'Scatter Performance'
export const subTitle = `${NUM_POINTS.toLocaleString()} points (${SPARSITY * 100}% sparse)`

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateSparseScatterData(), [])

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <strong>Performance Test:</strong> {NUM_POINTS.toLocaleString()} points ({SPARSITY * 100}% sparse)
      </div>
      <VisXYContainer<SparseScatterRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisScatter<SparseScatterRecord>
          x={d => d.x}
          y={d => d.y}
          size={d => d.size}
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </>
  )
}
