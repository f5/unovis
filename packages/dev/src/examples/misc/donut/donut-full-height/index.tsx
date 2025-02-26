import React from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Donut: Full Height'
export const subTitle = 'Testing the resize behavior'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [3, 2, 5, 4, 0, 1]
  return (
    <VisSingleContainer style={{ height: '100%' }}>
      <VisDonut
        value={d => d}
        data={data}
        padAngle={0.02}
        duration={props.duration}
        arcWidth={80}
      />
    </VisSingleContainer>
  )
}

