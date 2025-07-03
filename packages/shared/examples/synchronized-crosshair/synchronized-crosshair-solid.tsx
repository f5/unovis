import { JSX, createSignal, createMemo } from 'solid-js'
import { VisAxis, VisLine, VisArea, VisScatter, VisXYContainer, VisCrosshair, VisTooltip } from '@unovis/solid'
import { Position } from '@unovis/ts'

import { data1, data2, data3, DataRecord } from './data'

const SynchronizedCrosshair = (): JSX.Element => {
  const tooltipTemplate = (d: DataRecord) => `<div><b>X: ${d.x}</b><br/>Y: ${d.y.toFixed(1)}<br/>Y1: ${d.y1.toFixed(1)}<br/>Y2: ${d.y2.toFixed(1)}</div>`

  // State management for synchronization
  const [syncXPosition, setSyncXPosition] = createSignal<number | undefined>(undefined)
  const [activeChart, setActiveChart] = createSignal<'line' | 'area' | 'scatter' | null>(null)

  const handleCrosshairMove = (x: number | undefined | Date, chartId: 'line' | 'area' | 'scatter') => {
    const xValue = x instanceof Date ? x.getTime() : x
    setSyncXPosition(xValue)
    setActiveChart(xValue === undefined ? null : chartId)
  }

  // Memoized crosshair props for each chart - only update when values actually change
  const lineXPosition = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'line' ? sync : undefined
  })

  const lineForceShow = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'line' && sync !== undefined
  })

  const areaXPosition = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'area' ? sync : undefined
  })

  const areaForceShow = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'area' && sync !== undefined
  })

  const scatterXPosition = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'scatter' ? sync : undefined
  })

  const scatterForceShow = createMemo(() => {
    const active = activeChart()
    const sync = syncXPosition()
    return active !== 'scatter' && sync !== undefined
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h4>Line Chart</h4>
        <VisXYContainer data={data1} height='30dvh'>
          <VisLine x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y} />
          <VisCrosshair
            x={(d: DataRecord) => d.x}
            y={(d: DataRecord) => d.y}
            xPosition={lineXPosition()}
            forceShow={lineForceShow()}
            onCrosshairMove={(x) => handleCrosshairMove(x, 'line')}
            template={tooltipTemplate}
          />
          <VisTooltip
            verticalShift={200}
            horizontalPlacement={Position.Center}
          />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <h4>Area Chart</h4>
        <VisXYContainer data={data2} height='30dvh'>
          <VisArea x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y} />
          <VisCrosshair
            x={(d: DataRecord) => d.x}
            y={(d: DataRecord) => d.y}
            xPosition={areaXPosition()}
            forceShow={areaForceShow()}
            onCrosshairMove={(x) => handleCrosshairMove(x, 'area')}
            template={tooltipTemplate}
          />
          <VisTooltip
            verticalShift={200}
            horizontalPlacement={Position.Center}
          />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <h4>Scatter Plot</h4>
        <VisXYContainer data={data3} height='30dvh'>
          <VisScatter x={(d: DataRecord) => d.x} y={(d: DataRecord) => d.y} />
          <VisCrosshair
            x={(d: DataRecord) => d.x}
            y={(d: DataRecord) => d.y}
            xPosition={scatterXPosition()}
            forceShow={scatterForceShow()}
            onCrosshairMove={(x) => handleCrosshairMove(x, 'scatter')}
            template={tooltipTemplate}
          />
          <VisTooltip
            verticalShift={200}
            horizontalPlacement={Position.Center}
          />
          <VisAxis type='x' />
          <VisAxis type='y' />
        </VisXYContainer>
      </div>
    </div>
  )
}

export default SynchronizedCrosshair
