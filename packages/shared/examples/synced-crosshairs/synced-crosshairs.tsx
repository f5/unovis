import React, { useState } from 'react'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'
import { data, accessors, XYDataRecord } from './data'

export default function SyncedCrosshairs (): JSX.Element {
  const [forcePosition, setForcePosition] = useState<number | undefined>(75)
  const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined

  const template = (d: XYDataRecord): string =>
    `Forced at: ${forcePosition}<br/>Data: ${d.x}`

  const onCrosshairMove = (x: number | Date | undefined): void => {
    setForcePosition(typeof x === 'number' ? x : undefined)
  }

  const presets = [0, 25, 50, 75, 100, 125]

  return (
    <div>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        Crosshair forced to show at position: {forcePosition}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        {presets.map(v => (
          <button key={v} type='button' onClick={() => setForcePosition(v)}>{v}</button>
        ))}
        <button type='button' onClick={() => setForcePosition(undefined)}>clear</button>
        <input
          type='range'
          min={0}
          max={150}
          step={1}
          value={forcePosition ?? 0}
          style={{ flex: 1 }}
          onInput={(e) => setForcePosition(Number((e.target as HTMLInputElement).value))}
        />
      </div>

      <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
        <VisArea x={(d: XYDataRecord) => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair template={template} forceShowAt={forcePosition} onCrosshairMove={onCrosshairMove}/>
        <VisTooltip container={tooltipContainer}/>
      </VisXYContainer>

      <VisXYContainer<XYDataRecord>
        yDirection='south'
        data={data}
        margin={{ top: 5, left: 5 }}
        xDomain={[0, 100]}
      >
        <VisLine x={(d: XYDataRecord) => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair template={template} forceShowAt={forcePosition} onCrosshairMove={onCrosshairMove}/>
        <VisTooltip container={tooltipContainer}/>
      </VisXYContainer>

      <div style={{ height: '800px', width: '100%' }}/>
    </div>
  )
}
