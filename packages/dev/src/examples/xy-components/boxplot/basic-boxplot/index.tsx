import React, { useRef } from 'react'
import { VisXYContainer, VisBoxplot, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { BoxplotDataRecord, generateBoxplotDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Basic Boxplot'
export const subTitle = 'Generated Data'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateBoxplotDataRecords(7)

  return (
    <VisXYContainer data={data} margin={{ top: 5, left: 5 }} height={400}>
      <VisBoxplot<BoxplotDataRecord>
        x={d => d.x}
        median={d => d.median}
        quartiles={d => d.quartiles}
        whiskers={d => d.whiskers}
        duration={props.duration}
      />
      <VisAxis type='x' numTicks={7} duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair
        template={(d: BoxplotDataRecord) =>
          `median: ${d.median.toFixed(1)}<br/>q1–q3: ${d.quartiles[0].toFixed(1)}–${d.quartiles[1].toFixed(1)}<br/>min–max: ${d.whiskers[0].toFixed(1)}–${d.whiskers[1].toFixed(1)}`
        }
      />
      <VisTooltip ref={tooltipRef} />
    </VisXYContainer>
  )
}
