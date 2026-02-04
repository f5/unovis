import React, { useMemo } from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { generateTimeSeries } from '@/utils/data'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { Arrangement, TextAlign } from '@unovis/ts'

// Icons
import icon from './icon.svg?raw'

export const title = 'Line Icons'
export const subTitle = 'Start / End icons'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = generateTimeSeries(25, 20, 10).map((d, i) => ({
    ...d,
    type: `Row ${i}`,
    lineWidth: 5 + Math.random() * 15,
  }))
  type Datum = typeof data[number]

  const svgDefs = useMemo(() => `${icon}`, [])
  return (<>
    <VisXYContainer<Datum>
      data={data}
      height={300}
      svgDefs={svgDefs}
    >
      <VisTimeline
        lineRow={(d: Datum) => d.type as string}
        x={(d: Datum) => d.timestamp}
        rowHeight={20}
        lineWidth={(d) => d.lineWidth}
        lineCap
        rowLabelTextAlign={TextAlign.Left}
        duration={props.duration}
        lineStartIcon={'#circle_pending_filled'}
        lineEndIcon={'#circle_check_filled'}
        lineEndIconSize={25}
        lineStartIconColor={'rgb(38, 86, 201)'}
        lineEndIconColor={'rgb(38, 86, 201)'}
        lineEndIconArrangement={Arrangement.Outside}
        lineStartIconArrangement={Arrangement.Outside}
        showRowLabels
      />
      <VisAxis
        type='x'
        numTicks={3}
        tickFormat={(x: number) => new Date(x).toDateString()}
        duration={props.duration}
      />
    </VisXYContainer>
  </>
  )
}
