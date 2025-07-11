<script>
  import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisScatter, VisTooltip } from '@unovis/svelte'
  import { CurveType } from '@unovis/ts'
  import { countries, data } from './data'

  const fallbacks = [null, undefined, 0, 2000]
  let fallbackValue = fallbacks[0]
  let interpolation = true
  let showScatter = true

  // Define callback functions
  const getY = (c) => (d) => d[c.id]
  const xCallback = (d) => d.year
  const countriesYMemo = countries.map(getY)
</script>

<div>
  <div class="controls-container">
    <label>
      Select a fallback value for missing data points:
      <select bind:value={fallbackValue}>
        {#each fallbacks as option, i}
          <option value={option}>{String(option)}</option>
        {/each}
      </select>
    </label>
    <label>
      Interpolate: <input type="checkbox" bind:checked={interpolation} />
    </label>
    <label>
      Show Scatter: <input type="checkbox" bind:checked={showScatter} />
    </label>
  </div>
  <VisXYContainer data={data} xDomain={[1989, 2024]} width="100%" height="50vh">
    <VisLine
      curveType={CurveType.Linear}
      fallbackValue={fallbackValue}
      interpolateMissingData={interpolation}
      x={xCallback}
      y={countriesYMemo}
    />
    <VisCrosshair
      color={['var(--vis-color0)', 'var(--vis-color1)']}
      template={(d) => `Year: ${d.year} <br/> India: ${d.in ? `${Math.round(d.in || 0)}kWh` : 'NA'}<br/> Brazil: ${d.br ? `${Math.round(d.br || 0)}kWh` : 'NA'}`}
    />
    {#if showScatter}
      {#each countries as country, i}
        <VisScatter
          size={5}
          x={xCallback}
          color={country.color || `var(--vis-color${i})`}
          y={(d) => d[country.id]}
        />
      {/each}
    {/if}
    <VisTooltip />
    <VisAxis type="x" numTicks={10} />
    <VisAxis
      type="y"
      label="Electric power consumption (kWh per capita)"
      tickFormat={(d) => `${d}${d ? 'kWh' : ''}`}
      tickValues={[100, 1000, 2000, 3000, 4000]}
    />
  </VisXYContainer>
</div>

<style>
  .controls-container {
    background-color: var(--ifm-code-background);
    padding: 10px 20px;
    border-radius: 5px;
    border: 1px solid var(--ifm-code-background);
    margin-bottom: 10px;
    display: flex;
    width: 100%;
    gap: 30px;
  }
</style>
