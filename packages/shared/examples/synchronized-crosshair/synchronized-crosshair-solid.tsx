import { JSX } from 'solid-js'
import { VisAxis, VisLine, VisArea, VisScatter, VisXYContainer, VisCrosshair, VisTooltip } from '@unovis/solid'

import { data1, data2, data3, DataRecord } from './data'

const SynchronizedCrosshair = (): JSX.Element => {
  const tooltipTemplate = (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h4>Line Chart</h4>
        <VisXYContainer data={data1} height='30dvh'>
          <VisLine x={(d) => d.x} y={(d) => d.y} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <h4>Area Chart</h4>
        <VisXYContainer data={data2} height='30dvh'>
          <VisArea x={(d) => d.x} y={(d) => d.y} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <h4>Scatter Plot</h4>
        <VisXYContainer data={data3} height='30dvh'>
          <VisScatter x={(d) => d.x} y={(d) => d.y} />
          <VisCrosshair syncId="demo-sync" template={tooltipTemplate} />
          <VisTooltip />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>

      <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
        Hover over any chart to see synchronized crosshairs across all three charts
      </div>
    </div>
  )
}

export default SynchronizedCrosshair
