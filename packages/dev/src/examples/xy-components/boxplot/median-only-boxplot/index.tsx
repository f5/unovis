import React, { useRef } from 'react'
import { VisXYContainer, VisBoxplot, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { BoxplotDataRecord, generateBoxplotDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Median Only'
export const subTitle = 'Boxplot with just the median accessor'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  // Only the median is provided — no quartiles, no whiskers
  const data = generateBoxplotDataRecords(8).map(({ x, median }) => ({ x, median }))

  return (
    <VisXYContainer data={data} margin={{ top: 5, left: 5 }} height={400} yDomain={[0, 10]}>
      <VisBoxplot<BoxplotDataRecord>
        x={d => d.x}
        median={d => d.median}
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={8} duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair template={(d: BoxplotDataRecord) => `median: ${d.median?.toFixed(1)}`}/>
      <VisTooltip ref={tooltipRef}/>
    </VisXYContainer>
  )
}
