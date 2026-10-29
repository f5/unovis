import React, { useState } from 'react'
import { VisArea, VisAxis, VisBrush, VisBulletLegend, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function ElectricityGridDashboard (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeAuthority = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ authority: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls electricity-grid-controls">
        <label>
          Grid area
          <select value={state.authority} onChange={changeAuthority}>
            {c.authorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={c.legend} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Generation by fuel · GW</p>
        <VisXYContainer autoMargin={false} height={260} duration={600} data={view.data} xDomain={state.domain} margin={c.chartMargin}>
          <VisArea stackMinHeight={true} minHeight={1} x={c.time} y={c.fuelAccessors} color={c.fuelColors} curveType={c.CurveType.StepAfter} />
          <VisCrosshair forceShowAt={state.cursor} onCrosshairMove={view.onMove} template={c.generationTooltip} />
          <VisTooltip container={c.tooltipContainer} />
          <VisAxis type={'x'} label={'Time (UTC)'} tickFormat={c.dayLabel} numTicks={7} />
          <VisAxis type={'y'} label={'Generation (GW)'} />
        </VisXYContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Actual and day-ahead forecast demand · GW</p>
        <VisXYContainer autoMargin={false} height={190} duration={600} data={view.data} xDomain={state.domain} margin={c.chartMargin}>
          <VisLine x={c.time} y={c.demandAccessors} color={c.demandColors} curveType={c.CurveType.Linear} />
          <VisCrosshair forceShowAt={state.cursor} onCrosshairMove={view.onMove} template={c.demandTooltip} />
          <VisTooltip />
          <VisAxis type={'x'} label={'Time (UTC)'} tickFormat={c.dayLabel} numTicks={7} />
          <VisAxis type={'y'} label={'Demand (GW)'} />
        </VisXYContainer>
      </div>
      <div className="gallery-panel">
        <p className="gallery-caption">Drag to select a time window</p>
        <VisXYContainer autoMargin={false} height={75} duration={600} data={view.data} margin={c.chartMargin}>
          <VisLine x={c.time} y={c.demand} color={'var(--vis-color0)'} lineWidth={1} />
          <VisBrush draggable={true} selection={state.domain} onBrush={view.onBrush} />
          <VisAxis type={'x'} tickFormat={c.dayLabel} numTicks={7} />
        </VisXYContainer>
      </div>
    </div>
  )
}
