import React, { useRef, useState, useEffect, useMemo } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@/utils/data'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

export const title = 'Force Show At Position'
export const subTitle = 'Crosshair forced to show at specific position'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const [forcePosition, setForcePosition] = useState<number>(75)
  const data = useMemo(() => generateXYDataRecords(150), [])

  const accessors = useMemo(() => [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ], [])

  // Cycle through different positions to demonstrate the forceShowAt feature
  useEffect(() => {
    const interval = setInterval(() => {
      setForcePosition(prev => {
        const positions = [25, 50, 75, 100, 125]
        const currentIndex = positions.indexOf(prev)
        const nextIndex = (currentIndex + 1) % positions.length
        return positions[nextIndex]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#777' }}>
        Crosshair forced to show at position: {forcePosition}
      </div>
      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisArea x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
        <VisCrosshair
          template={(d: XYDataRecord) => `Forced at: ${forcePosition}<br/>Data: ${d.x}`}
          forceShowAt={forcePosition}
        />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>
    </div>
  )
}
