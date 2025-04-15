import { VisDonut, VisSingleContainer } from '@unovis/react'
import { DONUT_HALF_ANGLE_RANGE_TOP } from '@unovis/ts'
import React from 'react'

export const title = 'Half Donut: Labels'
export const subTitle = 'Testing the label offsets'
export const component = (): React.ReactNode => {
  const data = [3, 2, 5, 4, 0, 1]

  return (
    <VisSingleContainer style={{ height: '100%' }} >
      <VisDonut
        value={d => d}
        data={data}
        padAngle={0.02}
        duration={0}
        arcWidth={80}
        angleRange={DONUT_HALF_ANGLE_RANGE_TOP}
        centralLabel='Central Label'
        centralSubLabel='Central Sub Label'
        centralLabelOffsetY={-24}
      />
    </VisSingleContainer>
  )
}
