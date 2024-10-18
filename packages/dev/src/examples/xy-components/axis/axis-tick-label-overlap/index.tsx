import React from 'react'
import { VisXYContainer, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { Scale } from '@unovis/ts'

export const title = 'Axis Tick Label Overlap'
export const subTitle = 'Resolving overlapping labels'
export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  return (<>
    <VisXYContainer xDomain={[0, 1000]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
    <VisXYContainer xDomain={[0, 10000000]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
    <VisXYContainer xDomain={[0, 10000000]} height={75}>
      <VisAxis type='x' numTicks={25} duration={props.duration} tickTextHideOverlapping={true} tickTextAngle={15}/>
    </VisXYContainer>
    <VisXYContainer xDomain={[0, Date.now()]} height={125} xScale={Scale.scaleTime()}>
      <VisAxis type='x' numTicks={7} duration={props.duration} tickTextHideOverlapping={true}/>
    </VisXYContainer>
  </>)
}
