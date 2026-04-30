<script lang="ts">
  import { VisXYContainer, VisArea, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/svelte'
  import { data, accessors, XYDataRecord } from './data'

  let forcePosition: number | undefined = 75

  $: template = (d: XYDataRecord): string =>
    `Forced at: ${forcePosition}<br/>Data: ${d.x}`

  function onCrosshairMove (x: number | Date | undefined): void {
    forcePosition = typeof x === 'number' ? x : undefined
  }

  const tooltipContainer = typeof document !== 'undefined' ? document.body : undefined
  const presets = [0, 25, 50, 75, 100, 125]
</script>

<div>
  <div style="margin-bottom: 10px; font-size: 14px; color: #666">
    Crosshair forced to show at position: {forcePosition}
  </div>

  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px">
    {#each presets as v}
      <button type="button" on:click={() => { forcePosition = v }}>{v}</button>
    {/each}
    <button type="button" on:click={() => { forcePosition = undefined }}>clear</button>
    <input
      type="range"
      min="0"
      max="150"
      step="1"
      value={forcePosition ?? 0}
      style="flex: 1"
      on:input={(e) => { forcePosition = Number(e.currentTarget.value) }}
    />
  </div>

  <VisXYContainer {data} margin={{ top: 5, left: 5 }}>
    <VisArea x={(d) => d.x} y={accessors}/>
    <VisAxis type="x"/>
    <VisAxis type="y"/>
    <VisCrosshair {template} forceShowAt={forcePosition} {onCrosshairMove}/>
    <VisTooltip container={tooltipContainer}/>
  </VisXYContainer>

  <VisXYContainer
    yDirection="south"
    {data}
    margin={{ top: 5, left: 5 }}
    xDomain={[0, 100]}
  >
    <VisLine x={(d) => d.x} y={accessors}/>
    <VisAxis type="x"/>
    <VisAxis type="y"/>
    <VisCrosshair {template} forceShowAt={forcePosition} {onCrosshairMove}/>
    <VisTooltip container={tooltipContainer}/>
  </VisXYContainer>

  <div style="height: 800px; width: 100%"/>
</div>
