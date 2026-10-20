import { createSignal, createMemo, JSX } from 'solid-js'
import { VisBulletLegend, VisChordDiagram, VisSingleContainer, VisTooltip } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function StateMigrationChord (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state(), update))
  const changeSelected = (event: Event): void => {
    update({ selected: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Highlight a state
          <select value={state().selected} onChange={changeSelected}>
            {c.stateOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={[]} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Interstate movers · origin → destination</p>
        <VisSingleContainer height={530} duration={600}>
          <VisChordDiagram nodeWidth={28}
            data={view().data}
            nodeLabel={c.nodeLabel}
            nodeColor={c.nodeColor}
            linkColor={c.linkColor}
            nodeLabelAlignment={c.ChordLabelAlignment.Along}
            highlightedNodeId={view().highlightedNodeId}
            highlightedLinkIds={view().highlightedLinkIds}
            events={view().events}
            padAngle={0.045}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
