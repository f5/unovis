import React, { useCallback, useMemo, useRef, useState } from 'react'
import { VisXYContainer, VisLine, VisArea, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Synchronized Crosshair'
export const subTitle = 'Enhanced with data space synchronization'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [syncXPosition, setSyncXPosition] = useState<number | undefined>(undefined)
  const [activeChart, setActiveChart] = useState<'chart1' | 'chart2' | 'chart3' | null>(null)
  const tooltipRef = useRef(null)
  const data = useMemo(() => generateXYDataRecords(50), [])

  // Create a different dataset for chart 3 with different x range
  const data3 = useMemo(() => {
    const records = generateXYDataRecords(40)
    // Transform x values to a different range (e.g., 200-400 instead of 0-150)
    return records.map((d, i) => ({
      ...d,
      x: 20 + (i * 2), // Different x range: 100, 102, 104, ..., 178
      y: d.y * 0.8, // Slightly different y values
      y1: (d.y1 || 0) * 0.8,
      y2: (d.y2 || 0) * 0.8,
    }))
  }, [])

  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  // Callback for crosshair movement - syncs across charts
  const onCrosshairMove = useCallback((x: number | Date | undefined, chartId: 'chart1' | 'chart2' | 'chart3') => {
    const newPosition = x === undefined ? undefined : (typeof x === 'number' ? x : undefined)
    setSyncXPosition(newPosition)
    setActiveChart(x === undefined ? null : chartId)
  }, [])

  return (
    <>
      <VisXYContainer<XYDataRecord>
        data={data}
        margin={{ top: 5, left: 5 }}

      >
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
          xPosition={activeChart === 'chart2' || activeChart === 'chart3' ? syncXPosition : undefined}
          forceShow={(activeChart === 'chart2' || activeChart === 'chart3') && !!syncXPosition}
          onCrosshairMove={(x) => onCrosshairMove(x, 'chart1')}
          template={(d: XYDataRecord) => d ? `Chart 1 - x: ${d.x}, y: ${d.y}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord>
        data={data}
        margin={{ top: 5, left: 5 }}
      >
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
          xPosition={activeChart === 'chart1' || activeChart === 'chart3' ? syncXPosition : undefined}
          forceShow={(activeChart === 'chart1' || activeChart === 'chart3') && !!syncXPosition}
          onCrosshairMove={(x) => {
            return onCrosshairMove(x, 'chart2')
          }}
          template={(d: XYDataRecord) => d ? `Chart 2 - x: ${d.x}, y: ${d.y?.toFixed(2)}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord>
        data={data3}
        margin={{ top: 5, left: 5 }}
      >
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
          xPosition={activeChart === 'chart1' || activeChart === 'chart2' ? syncXPosition : undefined}
          forceShow={(activeChart === 'chart1' || activeChart === 'chart2') && !!syncXPosition}
          onCrosshairMove={(x) => onCrosshairMove(x, 'chart3')}
          template={(d: XYDataRecord) => d ? `Chart 3 - x: ${d.x}, y: ${d.y?.toFixed(2)}` : ''}
        />
        <VisTooltip ref={tooltipRef} container={document.body} />
      </VisXYContainer>
    </>
  )
}

