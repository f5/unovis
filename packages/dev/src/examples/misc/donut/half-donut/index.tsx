import React from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { DONUT_HALF_ANGLE_RANGE_TOP } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import './styles.css'

export const title = 'Donut: Half Donut'
export const subTitle = 'with labels and scaling'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = [0, 2, 0, 4, 0, 1]
  return (
    // TODO get this to properly scale to the container,
    // by changing "80vh" to something else or removing it.
    <VisSingleContainer
      height="80vh"

      // Margin for half donut top - works
      margin={{ top: 0, bottom: 14, left: 0, right: 0 }}

      // Margin for half donut right - untested
      // margin={{ top: 0, bottom: 0, left: 0, right: 12 }}

      // Margin for half donut bottom - untested
      // margin={{ top: 12, bottom: 0, left: 0, right: 0 }}

      // Margin for half donut left - untested
      // margin={{ top: 0, bottom: 0, left: 12, right: 0 }}
      className="half-donut-container"
    >
      <VisDonut
        value={d => d}
        data={data}
        showEmptySegments={true}
        padAngle={0.02}
        arcWidth={100}
        duration={props.duration}
        angleRange={DONUT_HALF_ANGLE_RANGE_TOP} // works
        // angleRange={DONUT_HALF_ANGLE_RANGE_LEFT} // untested
        // angleRange={DONUT_HALF_ANGLE_RANGE_BOTTOM} // untested
        // angleRange={DONUT_HALF_ANGLE_RANGE_LEFT} // untested
        centralLabel='Central Label'
        centralSubLabel='Sub Label'
      />
    </VisSingleContainer>
  )
}
