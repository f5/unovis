import React from 'react'
import { VisSingleContainer, VisHeatmap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Heatmap with Empty Cells & Offset'
export const subTitle = 'Undefined values render as empty cells; `offset` shifts the first datum'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const rnd = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type DataRecord = { value: number | undefined }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  // Some cells have no value (undefined) → rendered as empty cells
  const data: DataRecord[] = Array.from({ length: 84 }, (_, i) => {
    const r = rnd(i)
    return { value: r < 0.25 ? undefined : Math.round(r * 50) }
  })

  return (
    <VisSingleContainer height={320}>
      <VisHeatmap<DataRecord>
        data={data}
        value={d => d.value}
        numRows={7}
        offset={3}
        cellPadding={3}
        cellCornerRadius={3}
        rowLabel={row => WEEKDAYS[row]}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
