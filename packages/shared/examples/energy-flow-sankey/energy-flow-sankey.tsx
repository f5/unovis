import React, { useState } from 'react'
import { VisBulletLegend, VisSankey, VisSingleContainer, VisTooltip } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function EnergyFlowSankey (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeFocus = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ focus: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Focus
          <select value={state.focus} onChange={changeFocus}>
            {c.focusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={[]} />
      <p className="gallery-summary" aria-live="polite">
        {view.summary}
      </p>
      <div className="gallery-panel">
        <p className="gallery-caption">Primary sources → electricity conversion → end uses</p>
        <VisSingleContainer height={560} duration={600}>
          <VisSankey
            data={view.data}
            nodeColor={c.nodeColor}
            linkColor={c.linkColor}
            subLabel={c.subLabel}
            nodePadding={18}
            nodeWidth={12}
            labelMaxWidth={150}
            labelFit={c.FitMode.Wrap}
            labelForceWordBreak={false}
            nodeAlign={c.SankeyNodeAlign.Left}
            events={view.events}
            label={c.nodeLabel}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
