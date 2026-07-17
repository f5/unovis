<script lang="ts">
  import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/svelte'
  import { LabelOverflow } from '@unovis/ts'
  import { data } from './data'

  let yFrom = 2
  let yTo = 4
  let yAutoPosition = true
  let yOverflow: LabelOverflow = LabelOverflow.Smart

  let xFrom = 7
  let xTo = 9
  let xAutoPosition = true
  let xOverflow: LabelOverflow = LabelOverflow.Smart
</script>

<div class="controls">
  <fieldset>
    <legend>Plot band on y-axis (extra)</legend>
    <label>from: <input type="range" min="0" max="9" step="0.1" bind:value={yFrom} /> {yFrom.toFixed(1)}</label>
    <label>to: <input type="range" min="0" max="9" step="0.1" bind:value={yTo} /> {yTo.toFixed(1)}</label>
    <label><input type="checkbox" bind:checked={yAutoPosition} /> labelAutoPosition</label>
    <label style="opacity: {yAutoPosition ? 1 : 0.4}">labelOverflow:
      <select bind:value={yOverflow} disabled={!yAutoPosition}>
        <option value={LabelOverflow.Smart}>smart</option>
        <option value={LabelOverflow.Hide}>hide</option>
        <option value={LabelOverflow.Stack}>stack</option>
      </select>
    </label>
  </fieldset>

  <fieldset>
    <legend>Plot band on x-axis (extra)</legend>
    <label>from: <input type="range" min="0" max="14" step="0.1" bind:value={xFrom} /> {xFrom.toFixed(1)}</label>
    <label>to: <input type="range" min="0" max="14" step="0.1" bind:value={xTo} /> {xTo.toFixed(1)}</label>
    <label><input type="checkbox" bind:checked={xAutoPosition} /> labelAutoPosition</label>
    <label style="opacity: {xAutoPosition ? 1 : 0.4}">labelOverflow:
      <select bind:value={xOverflow} disabled={!xAutoPosition}>
        <option value={LabelOverflow.Smart}>smart</option>
        <option value={LabelOverflow.Hide}>hide</option>
        <option value={LabelOverflow.Stack}>stack</option>
      </select>
    </label>
  </fieldset>
</div>

<VisXYContainer height={600}>
  <VisLine {data} x={d => d.x} y={d => d.y} />
  <VisAxis type="x" />
  <VisAxis type="y" />
  <VisPlotband from={4} to={6} labelText="Plot band on x-axis" axis="x" labelPosition="top-inside" />
  <VisPlotband from={1} to={3} color="rgba(34, 99, 182, 0.3)" labelText="Plot band on y-axis" labelPosition="left-inside" />
  <VisPlotband
    from={yFrom}
    to={yTo}
    color="rgba(255, 165, 0, 0.3)"
    labelText={`Extra plot band on y-axis @ ${yFrom.toFixed(1)} – ${yTo.toFixed(1)}`}
    labelPosition="left-inside"
    labelAutoPosition={yAutoPosition}
    labelOverflow={yOverflow}
  />
  <VisPlotband
    from={xFrom}
    to={xTo}
    axis="x"
    color="rgba(220, 114, 0, 0.3)"
    labelText={`Extra plot band on x-axis @ ${xFrom.toFixed(1)} – ${xTo.toFixed(1)}`}
    labelPosition="top-inside"
    labelAutoPosition={xAutoPosition}
    labelOverflow={xOverflow}
  />
</VisXYContainer>

<style>
  .controls { margin-bottom: 12px; display: flex; gap: 20px; flex-wrap: wrap; }
  fieldset { border: 1px solid #444; border-radius: 4px; padding: 8px 12px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  legend { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px; }
</style>
