import React from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Donut: Minimum Segment Angle'
export const subTitle = 'Tiny segments survive the pad inset'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [6800, 2400, 790, 14, 10, 7, 5]
  return (
    <div style={{ display: 'flex' }}>
      <VisSingleContainer height={400} style={{ flex: 1, minWidth: 0 }}>
        <VisDonut
          value={d => d}
          data={data}
          padAngle={0.02}
          arcWidth={60}
          centralLabel={'padAngle: 0.02'}
          centralSubLabel={'the tiny segments collapse'}
          duration={props.duration}
        />
      </VisSingleContainer>
      <VisSingleContainer height={400} style={{ flex: 1, minWidth: 0 }}>
        <VisDonut
          value={d => d}
          data={data}
          padAngle={0.02}
          minSegmentAngle={0.08}
          arcWidth={60}
          centralLabel={'minSegmentAngle: 0.08'}
          centralSubLabel={'the tiny segments survive'}
          duration={props.duration}
        />
      </VisSingleContainer>
    </div>
  )
}
