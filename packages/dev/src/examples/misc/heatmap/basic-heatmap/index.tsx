import React from 'react'
import { VisSingleContainer, VisHeatmap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Basic Heatmap'
export const subTitle = 'A plain array of numbers laid out as a 7-row grid'

// Deterministic pseudo-random so the layout is stable across re-renders
const rnd = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data: number[] = Array.from({ length: 70 }, (_, i) => Math.round(rnd(i) * 100))

  return (
    <VisSingleContainer height={300}>
      <VisHeatmap<number>
        data={data}
        value={d => d}
        numRows={7}
        cellPadding={3}
        cellCornerRadius={3}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
