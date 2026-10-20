import React, { useState } from 'react'
import { VisAxis, VisBulletLegend, VisPlotline, VisScatter, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function StateMigrationBalance (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state)
  const changeSort = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Show states
          <select value={state.sort} onChange={changeSort}>
            {c.sortOptions.map(option => (
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
        <p className="gallery-caption">Interstate arrivals, departures, and net change</p>
        <VisXYContainer height={460} duration={600}>
          <VisStackedBar data={view.data} x={c.rank} y={c.accessors} color={c.balanceColors} barPadding={0.3} />
          <VisScatter data={view.data} x={c.rank} y={c.net} color={'var(--vis-color2)'} size={8} />
          <VisPlotline value={0} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} tickValues={c.rankTicks} tickFormat={view.stateLabel} tickTextAngle={-35} tickTextAlign={'right'} gridLine={false} />
          <VisAxis type={'y'} tickFormat={c.compact} label={'People'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
