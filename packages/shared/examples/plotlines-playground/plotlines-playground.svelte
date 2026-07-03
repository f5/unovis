<script lang="ts">
  import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/svelte'
  import { LabelOverflow } from '@unovis/ts'
  import { data } from './data'

  let yValue = 6
  let yAutoPosition = true
  let yOverflow: LabelOverflow = LabelOverflow.Smart

  let xValue = 10
  let xAutoPosition = true
  let xOverflow: LabelOverflow = LabelOverflow.Smart
</script>

<div class="controls">
  <fieldset>
    <legend>Plot line on y-axis (extra)</legend>
    <label>value: <input type="range" min="4" max="8" step="0.1" bind:value={yValue} /> {yValue.toFixed(1)}</label>
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
    <legend>Plot line on x-axis (extra)</legend>
    <label>value: <input type="range" min="8" max="12" step="0.1" bind:value={xValue} /> {xValue.toFixed(1)}</label>
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
  <VisPlotline value={6} color="rgba(7, 114, 21, 1)" labelText="Plot line on y-axis" labelPosition="top-left" />
  <VisPlotline value={10} color="rgba(220, 114, 0, 1)" axis="x" labelOrientation="vertical" labelText="Plot line on x-axis" />
  <VisPlotline
    value={yValue}
    color="rgba(7, 114, 21, 1)"
    labelText={`Extra plot line on y-axis @ ${yValue.toFixed(1)}`}
    labelPosition="top-left"
    labelAutoPosition={yAutoPosition}
    labelOverflow={yOverflow}
  />
  <VisPlotline
    value={xValue}
    color="rgba(220, 114, 0, 1)"
    axis="x"
    labelOrientation="vertical"
    labelText={`Extra plot line on x-axis @ ${xValue.toFixed(1)}`}
    labelPosition="top-right"
    labelAutoPosition={xAutoPosition}
    labelOverflow={xOverflow}
  />
</VisXYContainer>

<style>
  .controls { margin-bottom: 12px; display: flex; gap: 20px; flex-wrap: wrap; }
  fieldset { border: 1px solid #444; border-radius: 4px; padding: 8px 12px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  legend { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 4px; }
</style>
