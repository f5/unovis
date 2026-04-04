import React, { useState } from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'
import { Timeline, TimelineRowLabel } from '@unovis/ts'

import { TimeDataRecord, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Row Label Events'
export const subTitle = 'Hover events on label area'

const rows = ['Long Row', 'Empty Row 1', 'Empty Row 2']

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  const data = generateTimeSeries(15, 3, 10).map((d, i) => ({
    ...d,
    type: rows[i % rows.length],
  }))

  const events = {
    [Timeline.selectors.labelBackground]: {
      mouseover: (d: { label: string }) => setHoveredLabel(d.label),
      mouseleave: () => setHoveredLabel(null),
    },
  }

  return (<>
    <div style={{ marginBottom: 8, minHeight: 20, fontFamily: 'monospace', fontSize: 12 }}>
      {hoveredLabel ? `Hovered: ${hoveredLabel}` : 'Hover a row label'}
    </div>
    <VisXYContainer<TimeDataRecord>
      data={data} height={200}
      style={{
        '--vis-timeline-label-pointer-events': 'none',
      }}>
      <VisTimeline
        lineRow={(d: TimeDataRecord) => d.type as string}
        x={(d: TimeDataRecord) => d.timestamp}
        rowHeight={50}
        showRowLabels
        duration={props.duration}
        events={events}
      />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number | Date) => new Date(x).toDateString()} duration={props.duration} />
    </VisXYContainer>
  </>)
}
