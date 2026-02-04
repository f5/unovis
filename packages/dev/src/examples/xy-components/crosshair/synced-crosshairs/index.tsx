import React, { useRef, useState, useEffect, useMemo } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair, VisLine } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@/utils/data'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

export const title = 'Synced Crosshairs'
export const subTitle = 'Two Charts'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const [forcePosition, setForcePosition] = useState<number | Date | undefined>(75)
  const data = useMemo(() => generateXYDataRecords(150), [])

  const accessors = useMemo(() => [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ], [])

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Crosshair forced to show at position: {forcePosition?.toString()}
      </div>

      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} duration={props.duration}>
        <VisArea x={d => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair
          template={(d: XYDataRecord) => `Forced at: ${forcePosition}<br/>Data: ${d.x}`}
          forceShowAt={forcePosition}
          onCrosshairMove={(x, datum, datumIndex) => {
            setForcePosition(x)
            // eslint-disable-next-line no-console
            // console.log('onCrosshairMove', x, datum, datumIndex)
          }}
        />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} duration={props.duration} xDomain={[0, 100]}>
        <VisLine x={d => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair
          template={(d: XYDataRecord) => `Forced at: ${forcePosition}<br/>Data: ${d.x}`}
          forceShowAt={forcePosition}
          onCrosshairMove={(x) => {
            setForcePosition(x)
          }}
        />
        <VisTooltip ref={tooltipRef} container={document.body}/>
      </VisXYContainer>

      {/* This is a placeholder to make the example scrollable */}
      <div style={{ height: '800px', width: '100%' }}/>
    </div>
  )
}
