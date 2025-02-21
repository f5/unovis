import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { TextAlign } from '@unovis/ts'

export const title = 'Label Alignment'
export const subTitle = 'X Domain, auto line width'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = generateTimeSeries(25, 20, 10).map((d, i) => ({
    ...d,
    type: `Row ${i}`,
  }))

  const xDomain = [data[0].timestamp + 100000, data[data.length - 1].timestamp - 10000] as [number, number]
  return (<>
    <VisXYContainer<TimeDataRecord>
      data={data}
      height={300}
      xDomain={xDomain}
      margin={{
        left: 10,
        right: 10,
      }}
    >
      <VisTimeline
        lineRow={(d: TimeDataRecord) => d.type as string}
        x={(d: TimeDataRecord) => d.timestamp}
        rowHeight={20}
        lineWidth={undefined}
        lineCap
        showRowLabels
        rowLabelTextAlign={TextAlign.Left}
        duration={props.duration}
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
