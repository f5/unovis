import React from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'

export const title = 'Donut: Empty Segments'
export const subTitle = '+ Padding'
export const category = 'Donut'

export const component = (): JSX.Element => {
  const data = [0, 2, 0, 4, 0, 1]
  return (
    <VisSingleContainer height={400}>
      <VisDonut
        value={d => d}
        data={data}
        showEmptySegments={true}
        padAngle={0.02}
        arcWidth={100}
      />
    </VisSingleContainer>
  )
}

