import { createSignal, createMemo, JSX } from 'solid-js'
import { VisAxis, VisBoxplot, VisBulletLegend, VisScatter, VisTooltip, VisXYContainer } from '@unovis/solid'
import * as c from './constants'
import './styles.css'

export default function PenguinDistributions (): JSX.Element {
  const [state, setState] = createSignal(c.initialState)
  const update = (patch: Partial<c.ExampleState>): void => {
    setState(previous => ({ ...previous, ...patch }))
  }
  const view = createMemo(() => c.getView(state()))
  const changeSex = (event: Event): void => {
    update({ sex: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }

  return (
    <div class="gallery-example">
      <div class="gallery-controls">
        <label class="gallery-select">
          Sex
          <select value={state().sex} onChange={changeSex}>
            {c.sexOptions.map(option => (
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
        <p class="gallery-caption">Body mass by species</p>
        <VisXYContainer height={420} duration={600}>
          <VisScatter data={view().points} x={c.pointX} y={c.pointY} size={5} color={c.pointColor} />
          <VisBoxplot
            data={view().boxes}
            x={c.boxX}
            median={c.median}
            quartiles={c.quartiles}
            whiskers={c.whiskers}
            color={c.boxColor}
            barPadding={0.55}
          />
          <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
          <VisAxis type={'x'} tickValues={c.speciesTicks} tickFormat={c.speciesLabel} gridLine={false} />
          <VisAxis type={'y'} label={'Body mass (g)'} />
        </VisXYContainer>
      </div>
    </div>
  )
}
