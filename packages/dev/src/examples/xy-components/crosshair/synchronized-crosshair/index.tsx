import React, { useMemo, useRef } from 'react'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Synchronized Crosshair'
export const subTitle = 'Enhanced with data space synchronization'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = useMemo(() => generateXYDataRecords(50), [])

  const data3 = useMemo(() => {
    const records = generateXYDataRecords(40)
    return records.map((d, i) => ({
      ...d,
      x: 20 + (i * 2),
      y: d.y * 0.8,
      y1: (d.y1 || 0) * 0.8,
      y2: (d.y2 || 0) * 0.8,
    }))
  }, [])

  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <>
      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisLine
          x={d => d.x}
          y={accessors}
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration} />
        <VisAxis type='y' duration={props.duration} />
        <VisCrosshair
          x={d => d.x}
          y={accessors}
          syncId="group1"
          template={(d: XYDataRecord) => d ? `Chart 1, - x: ${d.x}, y: ${d.y?.toFixed(2)}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisLine
          x={(d: XYDataRecord) => d.x}
          y={accessors}
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration} />
        <VisAxis type='y' duration={props.duration} />
        <VisCrosshair
          x={(d: XYDataRecord) => d.x}
          y={accessors}
          template={(d: XYDataRecord) => d ? `Chart 2 - x: ${d.x}, y: ${d.y?.toFixed(2)}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={data3} margin={{ top: 5, left: 5 }}>
        <VisArea
          x={(d: XYDataRecord) => d.x}
          y={(d: XYDataRecord) => d.y}
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration} />
        <VisAxis type='y' duration={props.duration} />
        <VisCrosshair
          x={(d: XYDataRecord) => d.x}
          y={[(d: XYDataRecord) => d.y]}
          syncId="group1"
          template={(d: XYDataRecord) => d ? `Chart 3 - x: ${d.x}, y: ${d.y?.toFixed(2)}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>
    </>
  )
}

