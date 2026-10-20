import React, { useState } from 'react'
import { VisAxis, VisBulletLegend, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function PatternedTemperatureLines (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state)
  const changeMode = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ mode: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Appearance
          <select value={state.mode} onChange={changeMode}>
            {c.modeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={view.legend} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Seven-day mean temperature · °C</p>
        <VisXYContainer height={420} duration={600} data={c.data}>
          <VisLine x={c.time} y={c.accessors} pattern={c.pattern} color={view.colors} lineWidth={1.6} curveType={c.CurveType.Linear} />
          <VisCrosshair template={c.crosshairTemplate} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} />
          <VisAxis type={'x'} tickFormat={c.monthLabel} numTicks={6} />
          <VisAxis type={'y'} label={'Temperature (°C)'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
