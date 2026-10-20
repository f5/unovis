<script lang="ts">
  import { VisArea, VisAxis, VisBrush, VisBulletLegend, VisCrosshair, VisLine, VisPlotline, VisTooltip, VisXYContainer } from '@unovis/svelte'
  import * as c from './constants'
  import './styles.css'

  let state = c.initialState
  const update = (patch: Partial<c.ExampleState>): void => {
    state = { ...state, ...patch }
  }
  const reset = (): void => {
    state = c.initialState
  }
  $: view = c.getView(state, update)
</script>

<div class="gallery-example">
  <div class="gallery-controls">
    <button type="button" on:click={reset}>Reset</button>
  </div>
  <VisBulletLegend items={c.legend} />
  <p class="gallery-summary" aria-live="polite">{view.summary}</p>
  <div class="gallery-panel">
    <p class="gallery-caption">Sunspot number</p>
    <VisXYContainer height={420} duration={600} xDomain={state.domain}>
      <VisArea data={view.prediction} x={c.time} y={c.bandHeight} baseline={c.bandBaseline} color={'var(--vis-color1)'} opacity={0.18} />
      <VisLine data={view.observed} x={c.time} y={c.observed} color={'var(--vis-color0)'} lineWidth={1.4} curveType={c.CurveType.Linear} />
      <VisLine
        data={view.prediction}
        x={c.time}
        y={c.predicted}
        color={'var(--vis-color1)'}
        lineDashArray={c.forecastDash}
        curveType={c.CurveType.Linear} />
      <VisPlotline axis={'x'} value={view.forecastStart} labelText={'Forecast snapshot'} labelPosition={c.PlotlineLabelPosition.TopRight} />
      <VisCrosshair template={c.crosshairTemplate} data={view.data} />
      <VisTooltip className={c.tooltipClassName} container={c.tooltipContainer} />
      <VisAxis type={'x'} tickFormat={c.yearLabel} numTicks={7} />
      <VisAxis type={'y'} label={'Monthly sunspot number'} />
    </VisXYContainer>
  </div>
  <div class="gallery-panel">
    <p class="gallery-caption">Drag the overview to explore the record</p>
    <VisXYContainer height={85} duration={600}>
      <VisLine data={view.data} x={c.time} y={c.observed} lineWidth={1} color={'var(--vis-color0)'} />
      <VisBrush draggable={true} selection={state.domain} onBrush={view.onBrush} />
      <VisAxis type={'x'} tickFormat={c.yearLabel} numTicks={8} />
    </VisXYContainer>
  </div>
</div>
