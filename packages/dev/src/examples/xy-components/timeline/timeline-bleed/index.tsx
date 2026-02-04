import React, { useMemo } from 'react'
import { VisXYContainer, VisTimeline, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'
import { Arrangement } from '@unovis/ts'

import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

// Icons
import icon from './icon.svg?raw'

export const title = 'Timeline: Bleed'
export const subTitle = 'Automatic bleed calculation'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = useMemo(() => [
    { timestamp: 0, duration: 20, row: 'Long Row' },
    { timestamp: 0, duration: 0, row: 'Empty Row 1' },
    { timestamp: 10, duration: 0, row: 'Empty Row 1' },
    { timestamp: 15, duration: 0, row: 'Empty Row 1' },
    { timestamp: 20, duration: 0, row: 'Empty Row 1' },
    { timestamp: 18, duration: 0, row: 'Empty Row 2' },
    { timestamp: 24, duration: 0, row: 'Empty Row 2' },
    { timestamp: 27, duration: 0, row: 'Empty Row 2' },
  ], [])


  return (<>
    <VisXYContainer data={data} height={200} svgDefs={icon}>
      <VisTimeline<typeof data[number]>
        lineRow={(d) => d.row as string}
        lineDuration={(d) => d.duration}
        x={(d) => d.timestamp}
        rowHeight={50}
        lineWidth={undefined}
        showEmptySegments={true}
        // lineEndIcon={'#circle_check_filled'}
        lineStartIcon={'#circle_check_filled'}
        // lineEndIconArrangement={Arrangement.Outside}
        lineStartIconArrangement={Arrangement.Outside}
        showRowLabels
        duration={props.duration}
        lineCap={true}
      />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => (new Date(x).getTime()).toString()} duration={props.duration}/>
      <VisTooltip/>
    </VisXYContainer>
  </>
  )
}
