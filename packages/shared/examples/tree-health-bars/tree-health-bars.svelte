<script lang="ts">
  import { VisAxis, VisBulletLegend, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state)
  const changeSort = (event: Event): void => {
    update({ sort: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Sort boroughs
      <select value={state.sort} on:change={changeSort}>
        {#each c.sortOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisBulletLegend items={c.legend} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Share of living trees · %</p>
    <VisXYContainer height={390} duration={600} xDomain={c.percentDomain} yDirection={'south'}>
      <VisStackedBar data={view.data} x={c.rank} y={c.accessors} orientation={'horizontal'} color={c.healthColors} barPadding={0.35} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
      <VisAxis type={'x'} label={'Share of living trees (%)'} tickValues={c.percentTicks} />
      <VisAxis type={'y'} tickValues={c.rankTicks} tickFormat={view.boroughLabel} gridLine={false} />
    </VisXYContainer>
  </div>
</div>
