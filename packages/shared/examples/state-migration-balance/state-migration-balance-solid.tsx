import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBulletLegend, VisPlotline, VisScatter, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function StateMigrationBalance (): JSX.Element {
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
          Show states
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
        <p class="gallery-caption">Interstate arrivals, departures, and net change</p>
        <VisXYContainer height={460} duration={600}>
          <VisStackedBar data={view().data} x={c.rank} y={c.accessors} color={c.balanceColors} barPadding={0.3} />
          <VisScatter data={view().data} x={c.rank} y={c.net} color={'var(--vis-color2)'} size={8} />
          <VisPlotline value={0} />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} tickValues={c.rankTicks} tickFormat={view().stateLabel} tickTextAngle={-35} tickTextAlign={'right'} gridLine={false} />
          <VisAxis type={'y'} tickFormat={c.compact} label={'People'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
