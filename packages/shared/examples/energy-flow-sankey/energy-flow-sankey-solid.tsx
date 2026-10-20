import { createSignal, createMemo, JSX } from 'solid-js'
import { VisBulletLegend, VisSankey, VisSingleContainer, VisTooltip } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function EnergyFlowSankey (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state(), update))
  const changeFocus = (event: Event): void => {
    update({ focus: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Focus
          <select value={state().focus} onChange={changeFocus}>
            {c.focusOptions.map(option => (
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
        <p class="gallery-caption">Primary sources → electricity conversion → end uses</p>
        <VisSingleContainer height={560} duration={600}>
          <VisSankey
            data={view().data}
            nodeColor={c.nodeColor}
            linkColor={c.linkColor}
            subLabel={c.subLabel}
            nodePadding={18}
            nodeWidth={12}
            labelMaxWidth={150}
            labelFit={c.FitMode.Wrap}
            labelForceWordBreak={false}
            nodeAlign={c.SankeyNodeAlign.Left}
            events={view().events}
            label={c.nodeLabel}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
