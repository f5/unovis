<script lang="ts">
  import { VisBulletLegend, VisSingleContainer, VisTooltip, VisTreemap } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state, update)
  const changeBorough = (event: Event): void => {
    update({ borough: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeQuery = (event: Event): void => {
    update({ query: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Borough
      <select value={state.borough} on:change={changeBorough}>
        {#each c.boroughOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
    <label>
      Find a species
      <input type="search" value={state.query} on:input={changeQuery} />
    </label>
  </div>
  <VisBulletLegend items={[]} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Living trees · borough → species</p>
    <VisSingleContainer svgDefs={c.svgDefs} height={460} duration={600}>
      <VisTreemap
        data={view.data}
        value={c.value}
        layers={c.layers}
        numberFormat={c.compact}
        tilePadding={3}
        tilePaddingTop={22}
        labelInternalNodes={true}
        enableTileLabelFontSizeVariation={true}
        tileLabelMediumFontSize={c.tileLabelMediumFontSize}
        tileLabelLargeFontSize={c.tileLabelLargeFontSize}
        showTileClickAffordance={true}
        events={view.events}
        attributes={view.attributes}
        tileColor={view.tileColor}
        tileSort={c.tileSort}
        enableLightnessVariance={true}
        minTileSizeForLabel={20} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.tooltipTriggers} />
    </VisSingleContainer>
  </div>
</div>
