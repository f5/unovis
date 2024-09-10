import React from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Donut: Half Donut'
export const subTitle = 'with labels and scaling'

const halfDonutAngleRange: [number, number] = [-Math.PI / 2, Math.PI / 2]

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = [0, 2, 0, 4, 0, 1]
  return (
    <VisSingleContainer height={400}>
      {/* TODO add label and sub-label here */}
      <VisDonut
        value={d => d}
        data={data}
        showEmptySegments={true}
        padAngle={0.02}
        arcWidth={100}
        duration={props.duration}
        angleRange={halfDonutAngleRange}
        centralLabel='Central Label'
        centralSubLabel='Sub Label'
      />
    </VisSingleContainer>
  )
}

