/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback } from 'react'
import { VisXYContainer, VisLine, VisArea, VisScatter, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'

import { data1, data2, data3, DataRecord } from './data'

export default function SynchronizedCrosshair (): JSX.Element {
  const height = 200

  const tooltipTemplate = useCallback((d: DataRecord): string => {
    return `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4>Line Chart</h4>
        <VisXYContainer data={data1} height={height}>
          <VisLine x={useCallback((d: DataRecord) => d.x, [])} y={useCallback((d: DataRecord) => d.y, [])} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type="x" />
          <VisAxis type="y" />
        </VisXYContainer>
      </div>

      <div>
        <h4>Area Chart</h4>
        <VisXYContainer data={data2} height={height}>
          <VisArea x={useCallback((d: DataRecord) => d.x, [])} y={useCallback((d: DataRecord) => d.y, [])} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type="x" />
          <VisAxis type="y" />
        </VisXYContainer>
      </div>

      <div>
        <h4>Scatter Plot</h4>
        <VisXYContainer data={data3} height={height}>
          <VisScatter x={useCallback((d: DataRecord) => d.x, [])} y={useCallback((d: DataRecord) => d.y, [])} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type="x" />
          <VisAxis type="y" />
        </VisXYContainer>
      </div>

      <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
        Hover over any chart to see synchronized crosshairs across all three charts
      </div>
    </div>
  )
}
