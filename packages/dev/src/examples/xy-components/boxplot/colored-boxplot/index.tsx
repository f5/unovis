import React from 'react'
import { VisXYContainer, VisBoxplot, VisAxis } from '@unovis/react'

import { BoxplotDataRecord, generateBoxplotDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Colored Boxplot'
export const subTitle = 'Per-box color applied to every part'

const palette = ['#4d8cfd', '#f8442e', '#f5a623', '#1acb9a', '#8777d9', '#a4b2c8']

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateBoxplotDataRecords(6)

  return (
    <VisXYContainer<BoxplotDataRecord> data={data} margin={{ top: 5, left: 5 }} height={400}>
      <VisBoxplot
        x={d => d.x}
        median={d => d.median}
        quartiles={d => d.quartiles}
        whiskers={d => d.whiskers}
        // The `color` accessor is applied to every part of the box: the rectangle fill and stroke,
        // the median line, and the whiskers with their caps.
        color={(d: BoxplotDataRecord) => palette[d.x % palette.length]}
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={6} duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
    </VisXYContainer>
  )
}
