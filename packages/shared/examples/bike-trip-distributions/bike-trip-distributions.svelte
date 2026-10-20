<script lang="ts">
  import { VisAxis, VisBulletLegend, VisCrosshair, VisGroupedBar, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/svelte'
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
  const changeLimit = (event: Event): void => {
    update({ limit: (event.target as HTMLInputElement | HTMLSelectElement).value })
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
    <label class="gallery-select">
      Visible duration
      <select value={state.limit} on:change={changeLimit}>
        {#each c.limitOptions as option}<option value={option.value}>{option.label}</option>{/each}
      </select>
    </label>
  </div>
  <VisBulletLegend items={[]} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Trip-duration histogram · share of rides</p>
    <VisXYContainer height={270} duration={600} xDomain={view.domain}>
      <VisGroupedBar data={view.histogram} x={c.minute} y={c.share} color={'var(--vis-color0)'} groupPadding={0.05} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} triggers={c.histogramTooltipTriggers} />
      <VisAxis type={'x'} label={'Duration (minutes)'} />
      <VisAxis type={'y'} tickFormat={c.percent} label={'Share of rides'} />
    </VisXYContainer>
  </div>
  <div class="gallery-panel">
    <p class="gallery-caption">Cumulative share · rides shorter than each bin edge</p>
    <VisXYContainer height={240} duration={600} xDomain={view.domain} yDomain={c.cumulativeDomain}>
      <VisLine data={view.cumulative} x={c.edge} y={c.cumulative} color={'var(--vis-color1)'} curveType={c.CurveType.StepAfter} />
      <VisPlotline value={0.5} labelText={'50% of rides'} labelPosition={c.PlotlineLabelPosition.TopLeft} />
      <VisCrosshair template={c.cumulativeTooltip} data={view.cumulative} />
      <VisTooltip className={c.tooltipClassName} />
      <VisAxis type={'x'} label={'Duration (minutes)'} />
      <VisAxis type={'y'} tickFormat={c.percent} label={'Cumulative share'} />
    </VisXYContainer>
  </div>
</div>
