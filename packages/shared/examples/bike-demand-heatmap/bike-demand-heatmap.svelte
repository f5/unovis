<script lang="ts">
  import { VisRollingPinLegend, VisHeatmap, VisSingleContainer, VisTooltip } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state)
  const changeRider = (event: Event): void => {
    update({ rider: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Riders
      <select value={state.rider} on:change={changeRider}>
        {#each c.riderOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisRollingPinLegend rects={c.colorRange} leftLabelText="0" rightLabelText={view.maxLabel} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Average trip starts · weekday × hour</p>
    <VisSingleContainer height={330} duration={600}>
      <VisHeatmap
        data={view.data}
        value={c.value}
        numRows={7}
        colorRange={c.colorRange}
        colorDomain={view.colorDomain}
        rowLabel={c.weekdayLabel}
        columnLabel={c.hourLabel}
        cellPadding={3}
        cellCornerRadius={3}
        cursor={'pointer'} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
    </VisSingleContainer>
  </div>
</div>
