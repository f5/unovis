import React, { useState } from 'react'
import { VisAxis, VisBoxplot, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function PenguinDistributions (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state)
  const changeSex = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ sex: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Sex
          <select value={state.sex} onChange={changeSex}>
            {c.sexOptions.map(option => (
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
        <p className="gallery-caption">Body mass by species</p>
        <VisXYContainer height={420} duration={600}>
          <VisScatter data={view.points} x={c.pointX} y={c.pointY} size={5} color={c.pointColor} />
          <VisBoxplot
            data={view.boxes}
            x={c.boxX}
            median={c.median}
            quartiles={c.quartiles}
            whiskers={c.whiskers}
            color={c.boxColor}
            barPadding={0.55}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} tickValues={c.speciesTicks} tickFormat={c.speciesLabel} gridLine={false} />
          <VisAxis type={'y'} label={'Body mass (g)'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
