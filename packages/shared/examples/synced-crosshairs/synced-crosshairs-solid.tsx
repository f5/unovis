import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/solid'
import { createSignal, For, JSX } from 'solid-js'

import { data, accessors, XYDataRecord } from './data'

const SyncedCrosshairs = (): JSX.Element => {
  const [forcePosition, setForcePosition] = createSignal<number | undefined>(75)

  const template = (d: XYDataRecord): string =>
    `Forced at: ${forcePosition()}<br/>Data: ${d.x}`

  const onCrosshairMove = (x: number | Date | undefined): void => {
    setForcePosition(typeof x === 'number' ? x : undefined)
  }

  const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
  const presets = [0, 25, 50, 75, 100, 125]

  return (
    <div>
      <div style='margin-bottom: 10px; font-size: 14px; color: #666'>
        Crosshair forced to show at position: {forcePosition()}
      </div>

      <div style='display: flex; gap: 8px; align-items: center; margin-bottom: 10px'>
        <For each={presets}>
          {(v) => <button type='button' onClick={() => setForcePosition(v)}>{v}</button>}
        </For>
        <button type='button' onClick={() => setForcePosition(undefined)}>clear</button>
        <input
          type='range'
          min='0'
          max='150'
          step='1'
          value={forcePosition() ?? 0}
          style='flex: 1'
          onInput={(e) => setForcePosition(Number((e.currentTarget as HTMLInputElement).value))}
        />
      </div>

      <VisXYContainer data={data} margin={{ top: 5, left: 5 }}>
        <VisArea x={(d: XYDataRecord) => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair template={template} forceShowAt={forcePosition()} onCrosshairMove={onCrosshairMove}/>
        <VisTooltip container={tooltipContainer}/>
      </VisXYContainer>

      <VisXYContainer
        yDirection='south'
        data={data}
        margin={{ top: 5, left: 5 }}
        xDomain={[0, 100]}
      >
        <VisLine x={(d: XYDataRecord) => d.x} y={accessors}/>
        <VisAxis type='x'/>
        <VisAxis type='y'/>
        <VisCrosshair template={template} forceShowAt={forcePosition()} onCrosshairMove={onCrosshairMove}/>
        <VisTooltip container={tooltipContainer}/>
      </VisXYContainer>

      <div style='height: 800px; width: 100%'/>
    </div>
  )
}

export default SyncedCrosshairs
