<script lang="ts">
  import { VisAxis, VisBulletLegend, VisScatter, VisSingleContainer, VisStackedBar, VisTooltip, VisTopoJSONMap, VisXYContainer } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  $: view = c.getView(state, update)
  const changeMinimum = (event: Event): void => {
    update({ minimum: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
  const changeHalf = (event: Event): void => {
    update({ half: (event.target as HTMLInputElement | HTMLSelectElement).value })
  }
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <label class="gallery-select">
      Minimum magnitude
      <select value={state.minimum} on:change={changeMinimum}>
        {#each c.magnitudeOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
    <label class="gallery-select">
      Dates
      <select value={state.half} on:change={changeHalf}>
        {#each c.dateOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisBulletLegend items={[]} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Epicenters · click a point to select</p>
    <VisSingleContainer height={300} duration={600}>
      <VisTopoJSONMap
        data={view.mapData}
        topojson={c.world}
        pointId={c.id}
        pointRadius={view.pointRadius}
        pointColor={view.pointColor}
        pointStrokeWidth={1}
        events={view.mapEvents}
        disableZoom={true}
        latitude={c.latitude}
        longitude={c.longitude} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.mapTooltipTriggers} />
    </VisSingleContainer>
  </div>
  <div class="gallery-panel">
    <p class="gallery-caption">Depth and magnitude · click a point to select</p>
    <VisXYContainer autoMargin={false} margin={c.chartMargin} height={230} duration={600}>
      <VisScatter data={view.data} x={c.depth} y={c.magnitude} size={view.pointSize} color={view.pointColor} events={view.scatterEvents} />
      <VisTooltip className={c.tooltipClassName} triggers={c.scatterTooltipTriggers} />
      <VisAxis type={'x'} label={'Depth (km)'} />
      <VisAxis type={'y'} label={'Magnitude'} />
    </VisXYContainer>
  </div>
  <div class="gallery-panel">
    <p class="gallery-caption">Daily event counts · UTC</p>
    <VisXYContainer autoMargin={false} margin={c.chartMargin} height={140} duration={600}>
      <VisStackedBar data={view.daily} x={c.day} y={c.count} color={'var(--vis-color0)'} barPadding={0.2} />
      <VisAxis type={'x'} tickFormat={c.dayLabel} numTicks={8} />
      <VisAxis type={'y'} numTicks={3} />
    </VisXYContainer>
  </div>
</div>
