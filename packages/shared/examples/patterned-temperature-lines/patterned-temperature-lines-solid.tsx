import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function PatternedTemperatureLines (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeMode = (event: Event): void => {
    update({ mode: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Appearance
          <select value={state().mode} onChange={changeMode}>
            {c.modeOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={view().legend} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Seven-day mean temperature · °C</p>
        <VisXYContainer height={420} duration={600} data={c.data}>
          <VisLine x={c.time} y={c.accessors} pattern={c.pattern} color={view().colors} lineWidth={1.6} curveType={c.CurveType.Linear} />
          <VisCrosshair template={c.crosshairTemplate} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} />
          <VisAxis type={'x'} tickFormat={c.monthLabel} numTicks={6} />
          <VisAxis type={'y'} label={'Temperature (°C)'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
