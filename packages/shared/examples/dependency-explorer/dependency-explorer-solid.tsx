import { createSignal, createMemo, JSX } from 'solid-js'
import { VisBulletLegend, VisGraph, VisSingleContainer, VisTooltip } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function DependencyExplorer (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state(), update))
  const changeQuery = (event: Event): void => {
    update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeLayout = (event: Event): void => {
    update({ layout: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example dependency-explorer">
      <div class="gallery-controls">
        <label>
          Find a package
          <input type="search" value={state().query} onInput={changeQuery} />
        </label>
        <label class="gallery-select">
          Layout
          <select value={state().layout} onChange={changeLayout}>
            {c.layoutOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={c.legend} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Selected direct dependencies</p>
        <VisSingleContainer svgDefs={c.svgDefs} height={500} duration={600}>
          <VisGraph nodeStroke={c.nodeFill} nodeIconSize={22} nodeIcon={c.nodeIcon}
            data={view().data}
            layoutType={state().layout}
            nodeLabel={c.nodeLabel}
            nodeSubLabel={c.nodeSubLabel}
            nodeFill={'var(--gallery-node-fill)'}
            nodeSize={34}
            linkArrow={'single'}
            linkWidth={1.5}
            linkCurvature={1}
            selectedNodeId={state().selected}
            events={view().events}
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
