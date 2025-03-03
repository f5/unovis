import React, { useMemo } from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { Arrangement, TextAlign, TimelineArrow } from '@unovis/ts'

// Icons
import icon from './icon.svg?raw'

export const title = 'Timeline Arrows'
export const subTitle = 'Between the lines'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const lineIconSize = 25
  const data = Array(10).fill(0).map((_, i) => ({
    timestamp: Date.now() + i * 1000 * 60 * 60 * 24,
    length: 1000 * 60 * 60 * 24,
    id: i.toString(),
    type: `Row ${i}`,
    lineWidth: 5 + Math.random() * 15,
  }))

  type Datum = typeof data[number]

  const arrows = data.map((d, i) => {
    if (i === data.length - 1) return undefined

    return {
      x: d.timestamp + d.length,
      lineSourceId: d.id,
      lineTargetId: data[i + 1].id,
      xOffsetPx: lineIconSize / 2,
      lineSourceMarginPx: (lineIconSize - d.lineWidth) / 2,
      lineTargetMarginPx: 4,
    }
  }).filter(Boolean) as TimelineArrow[]

  const svgDefs = useMemo(() => `${icon}`, [])
  return (<>
    <VisXYContainer<Datum>
      data={data}
      height={300}
      svgDefs={svgDefs}
    >
      <VisTimeline
        id={(d) => d.id}
        lineRow={(d: Datum) => d.type as string}
        x={(d: Datum) => d.timestamp}
        rowHeight={40}
        lineWidth={(d) => d.lineWidth}
        lineCap
        showEmptySegments
        showRowLabels
        rowLabelTextAlign={TextAlign.Left}
        duration={props.duration}
        lineEndIcon={'#circle_check_filled'}
        lineEndIconSize={lineIconSize}
        lineStartIconColor={'#fff'}
        lineEndIconColor={'rgb(38, 86, 201)'}
        lineEndIconArrangement={Arrangement.Outside}
        arrows={arrows}
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
