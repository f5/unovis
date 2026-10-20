import React, { useState } from 'react'
import { VisBulletLegend, VisNestedDonut, VisSingleContainer, VisTooltip } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function ExoplanetDiscoveries (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeEra = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ era: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Discovery period
          <select value={state.era} onChange={changeEra}>
            {c.eraOptions.map(option => (
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
        <p className="gallery-caption">Discovery method → facility</p>
        <VisSingleContainer height={500} duration={600}>
          <VisNestedDonut
            data={view.data}
            layers={view.layers}
            value={c.value}
            direction={'outwards'}
            centralLabel={view.centralLabel}
            centralSubLabel={view.centralSubLabel}
            segmentColor={view.segmentColor}
            layerSettings={c.layerSettings}
            sort={c.sort}
            events={view.events}
            showBackground={true}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
