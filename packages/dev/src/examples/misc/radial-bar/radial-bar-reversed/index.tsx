import React from 'react'
import { VisSingleContainer, VisRadialBar } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Radial Bar: Reversed Order'
export const subTitle = '`reverseOrder` puts the first datum innermost'

type DataRecord = { key: string; value: number }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data: DataRecord[] = [
    { key: 'Step 1', value: 9 },
    { key: 'Step 2', value: 6 },
    { key: 'Step 3', value: 4 },
    { key: 'Step 4', value: 2 },
  ]
  return (
    <VisSingleContainer height={400}>
      <VisRadialBar<DataRecord>
        value={d => d.value}
        data={data}
        duration={props.duration}
        reverseOrder
        trackWidth={14}
        trackPadding={3}
      />
    </VisSingleContainer>
  )
}
