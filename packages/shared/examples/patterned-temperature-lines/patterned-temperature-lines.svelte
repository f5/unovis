<script lang="ts">
  import { VisAxis, VisBulletLegend, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state)
  const changeMode = (event: Event): void => {
    update({ mode: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Appearance
      <select value={state.mode} on:change={changeMode}>
        {#each c.modeOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisBulletLegend items={view.legend} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Seven-day mean temperature · °C</p>
    <VisXYContainer height={420} duration={600} data={c.data}>
      <VisLine x={c.time} y={c.accessors} pattern={c.pattern} color={view.colors} lineWidth={1.6} curveType={c.CurveType.Linear} />
      <VisCrosshair template={c.crosshairTemplate} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} />
      <VisAxis type={'x'} tickFormat={c.monthLabel} numTicks={6} />
      <VisAxis type={'y'} label={'Temperature (°C)'} />
    </VisXYContainer>
  </div>
</div>
