import { createSignal, createMemo, JSX } from 'solid-js'
import { VisBulletLegend, VisNestedDonut, VisSingleContainer, VisTooltip } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function ExoplanetDiscoveries (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state(), update))
  const changeEra = (event: Event): void => {
    update({ era: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Discovery period
          <select value={state().era} onChange={changeEra}>
            {c.eraOptions.map(option => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <VisBulletLegend items={view().legend} />
      <p class="gallery-summary" aria-live="polite">
        {view().summary}
      </p>
      <div class="gallery-panel">
        <p class="gallery-caption">Discovery method → facility</p>
        <VisSingleContainer height={500} duration={600}>
          <VisNestedDonut
            data={view().data}
            layers={view().layers}
            value={c.value}
            direction={'outwards'}
            centralLabel={view().centralLabel}
            centralSubLabel={view().centralSubLabel}
            segmentColor={view().segmentColor}
            layerSettings={c.layerSettings}
            sort={c.sort}
            events={view().events}
            showBackground={true}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
        </VisSingleContainer>
      </div>
    </div>
  )
}
