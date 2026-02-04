import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { VisDonut, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const title = 'Donut: Empty Segments'
export const subTitle = '+ Padding'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [0, 2, 0, 4, 0, 1]
  return (
    <VisSingleContainer height={400}>
      <VisDonut
        value={d => d}
        data={data}
        showEmptySegments={true}
        padAngle={0.02}
        arcWidth={100}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
