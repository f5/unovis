import React, { useMemo, useState, useEffect } from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { Arrangement, TextAlign, TimelineArrow } from '@unovis/ts'

// Icons
import icon from './icon.svg?raw'

export const title = 'Timeline Arrows'
export const subTitle = 'Between the lines'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const generateData = (length: number) => Array(length).fill(0).map((_, i) => ({
  timestamp: Date.now() + i * 1000 * 60 * 60 * 24 + Math.random() * 1000 * 60 * 60 * 24,
  length: 1000 * 60 * 60 * 24,
  id: i.toString(),
  type: `Row ${i}`,
  lineWidth: 5 + Math.random() * 15,
}))

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const lineIconSize = 25
  const [data, setData] = useState(() => generateData(15))

  useEffect(() => {
    const interval = setInterval(() => { setData(generateData(12)) }, 6000)
    return () => clearInterval(interval)
  }, [])

  type Datum = typeof data[number]

  const arrows = data.map((d, i) => {
    if (i === data.length - 1) return undefined

    return {
      id: `arrow-${i}`,
      xSource: d.timestamp + d.length,
      xSourceOffsetPx: 12,
      xTargetOffsetPx: 0,
      lineSourceId: d.id,
      lineTargetId: data[i + 1].id,
      lineSourceMarginPx: (lineIconSize - d.lineWidth) / 2,
      lineTargetMarginPx: 2,
    }
  }).filter(Boolean) as TimelineArrow[]

  const svgDefs = useMemo(() => `${icon}`, [])
  return (<>
    <VisXYContainer<Datum>
      data={data}
      height={400}
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
