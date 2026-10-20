import React, { useState } from 'react'
import { VisBulletLegend, VisGraph, VisSingleContainer, VisTooltip } from '@unovis/react'
import * as c from './constants'
import './styles.css'

export default function DependencyExplorer (): React.ReactElement {
  const [state, setState] = useState(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => setState(previous => ({ ...previous, ...patch }))
  const view = c.getView(state, update)
  const changeQuery = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeLayout = (event: React.FormEvent<HTMLInputElement | HTMLSelectElement>): void => {
    update({ layout: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div className="gallery-example dependency-explorer">
      <div className="gallery-controls">
        <label>
          Find a package
          <input type="search" value={state.query} onInput={changeQuery} />
        </label>
        <label className="gallery-select">
          Layout
          <select value={state.layout} onChange={changeLayout}>
            {c.layoutOptions.map(option => (
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
        <p className="gallery-caption">Selected direct dependencies</p>
        <VisSingleContainer svgDefs={c.svgDefs} height={500} duration={600}>
          <VisGraph nodeStroke={c.nodeFill} nodeIconSize={22} nodeIcon={c.nodeIcon}
            data={view.data}
            layoutType={state.layout}
            nodeLabel={c.nodeLabel}
            nodeSubLabel={c.nodeSubLabel}
            nodeFill={'var(--gallery-node-fill)'}
            nodeSize={34}
            linkArrow={'single'}
            linkWidth={1.5}
            linkCurvature={1}
            selectedNodeId={state.selected}
            events={view.events}
            fitViewPadding={45}
            layoutGroupOrder={c.groupOrder}
            layoutParallelNodesPerColumn={6}
            layoutParallelNodeSpacing={c.nodeSpacing}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
