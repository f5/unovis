import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function TreeHealthBars (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeSort = (event: Event): void => {
    update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Sort boroughs
          <select value={state().sort} onChange={changeSort}>
            {c.sortOptions.map(option => (
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
        <p class="gallery-caption">Share of living trees · %</p>
        <VisXYContainer height={390} duration={600} xDomain={c.percentDomain} yDirection={'south'}>
          <VisStackedBar
            data={view().data}
            x={c.rank}
            y={c.accessors}
            orientation={'horizontal'}
            color={c.healthColors}
            barPadding={0.35}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} label={'Share of living trees (%)'} tickValues={c.percentTicks} />
          <VisAxis type={'y'} tickValues={c.rankTicks} tickFormat={view().boroughLabel} gridLine={false} />
        </VisXYContainer>
      </div>
    </div>
  )
}
