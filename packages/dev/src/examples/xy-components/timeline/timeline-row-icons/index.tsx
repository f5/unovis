import React, { useMemo } from 'react'
import { VisXYContainer, VisTimeline, VisAxis } from '@unovis/react'

import { generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { TextAlign } from '@unovis/ts'

// Icons
import icon from './icon.svg?raw'

export const title = 'Row Icons'
export const subTitle = 'Before text labels'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const labels = ['English', 'Mandarin', 'Spanish', 'Hindi', 'Arabic', 'French', 'Portuguese']
  const data = generateTimeSeries(7, 20, 10).map((d, i) => ({
    ...d,
    type: labels[i],
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
        rowHeight={undefined}
        lineWidth={(d) => d.lineWidth}
        lineCap
        rowLabelTextAlign={TextAlign.Left}
        rowMaxLabelWidth={45}
        rowLabelMargin={10}
        duration={props.duration}
        rowIcon={() => ({ href: '#chevron_down', size: 20, color: 'rgb(38, 86, 201)' })}
        showRowLabels
      />
      <VisAxis
        type='x'
        numTicks={3}
        tickFormat={(tick: number | Date) => new Date(tick).toDateString()}
        duration={props.duration}
      />
    </VisXYContainer>
  </>
  )
}
