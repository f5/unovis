import React, { useState } from 'react'
import { VisBulletLegend, VisChordDiagram, VisSingleContainer, VisTooltip } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function StateMigrationChord (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeSelected = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ selected: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example">
      <div className="gallery-controls">
        <label className="gallery-select">
          Highlight a state
          <select value={state.selected} onChange={changeSelected}>
            {c.stateOptions.map(option => (
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
        <p className="gallery-caption">Interstate movers · origin → destination</p>
        <VisSingleContainer height={530} duration={600}>
          <VisChordDiagram nodeWidth={28}
            data={view.data}
            nodeLabel={c.nodeLabel}
            nodeColor={c.nodeColor}
            linkColor={c.linkColor}
            nodeLabelAlignment={c.ChordLabelAlignment.Along}
            highlightedNodeId={view.highlightedNodeId}
            highlightedLinkIds={view.highlightedLinkIds}
            events={view.events}
            padAngle={0.045}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
