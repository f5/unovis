import React from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Leaflet Map: Dark Theme'
export const subTitle = 'Dark theme selectors for chart styling'

export const component = (
  props: ExampleViewerDurationProps,
): React.ReactNode => {  
  const data = [
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 3, y: 4 },
  ]

  return (
    <VisXYContainer data={data} height={400}>
      <VisLine x={(d) => d.x} y={(d) => d.y} duration={props.duration} />
      <VisAxis type="x" duration={props.duration} />
      <VisAxis type="y" duration={props.duration} />
    </VisXYContainer>
  )
}
