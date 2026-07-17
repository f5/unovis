import React from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { TextAlign, TimelineConfigInterface, TrimMode } from '@unovis/ts'

export const title = 'Row Label Width'
export const subTitle = 'Tweak the labels'

const longLabels = [
  'Short',
  'Medium length row label',
  'Very long label that should be truncated when width is limited',
  'A',
  'Another long one for testing ellipsis behavior',
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateTimeSeries(15, 5, 10).map((d, i) => ({
    ...d,
    type: longLabels[i % longLabels.length],
  }))

  const common: TimelineConfigInterface<TimeDataRecord> = {
    lineRow: (d: TimeDataRecord) => d.type as string,
    x: (d: TimeDataRecord) => d.timestamp,
    rowHeight: 24,
    showRowLabels: true,
    duration: props.duration,
    rowLabelTrimMode: TrimMode.End,
    rowLabelTextAlign: TextAlign.Right,
  }
  const axisProps = { type: 'x' as const, numTicks: 3, tickFormat: (x: number | Date) => new Date(x).toDateString(), duration: props.duration }

  const rowLabelWidth = 120
  const rowMaxLabelWidth = 180
  return (
    <>
      <p>Using precise <code>rowLabelWidth</code> value: {rowLabelWidth}px</p>
      <VisXYContainer<TimeDataRecord> data={data} height={200} margin={{ left: 0, right: 0, bottom: 40 }}>
        <VisTimeline {...common} rowLabelWidth={rowLabelWidth} />
        <VisAxis {...axisProps} />
      </VisXYContainer>
      <VisXYContainer<TimeDataRecord> data={data} height={200} margin={{ left: 10, right: 10, bottom: 40 }} style={{ marginTop: 24 }}>
        <p>Using <code>rowMaxLabelWidth</code> value: {rowMaxLabelWidth}px</p>
        <VisTimeline {...common} rowMaxLabelWidth={rowMaxLabelWidth} />
        <VisAxis {...axisProps} />
      </VisXYContainer>
    </>
  )
}
