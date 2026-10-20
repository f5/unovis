<script lang="ts">
  import { VisBulletLegend, VisNestedDonut, VisSingleContainer, VisTooltip } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state, update)
  const changeEra = (event: Event): void => {
    update({ era: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Discovery period
      <select value={state.era} on:change={changeEra}>
        {#each c.eraOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisBulletLegend items={view.legend} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Discovery method → facility</p>
    <VisSingleContainer height={500} duration={600}>
      <VisNestedDonut
        data={view.data}
        layers={view.layers}
        value={c.value}
        direction={'outwards'}
        centralLabel={view.centralLabel}
        centralSubLabel={view.centralSubLabel}
        segmentColor={view.segmentColor}
        layerSettings={c.layerSettings}
        sort={c.sort}
        events={view.events}
        showBackground={true} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
    </VisSingleContainer>
  </div>
</div>
