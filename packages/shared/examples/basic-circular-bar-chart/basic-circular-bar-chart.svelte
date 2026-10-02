<script lang="ts">
  import { VisSingleContainer, VisCircularBar, VisTooltip, VisBulletLegend } from '@unovis/svelte'
  import { CircularBar } from '@unovis/ts'
  import type { CircularBarArcDatum } from '@unovis/ts'
  import type { DataRecord } from './data'
  import { data, maxValue } from './data'

  const legendItems = data.map(d => ({ name: d.key, color: d.color }))

  const triggers = {
    [CircularBar.selectors.bar]: (d: CircularBarArcDatum<DataRecord>) => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  }
</script>

<div class="circular-bar-chart">
  <VisBulletLegend items={legendItems}/>
  <VisSingleContainer height={400}>
    <VisCircularBar
      value={d => d.value}
      color={d => d.color}
      icon={d => d.icon}
      {data}
      maxValue={maxValue}
    />
    <VisTooltip {triggers}/>
  </VisSingleContainer>
</div>

<style>
  @font-face {
    font-family: 'Font Awesome 6 Free';
    src: url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/webfonts/fa-solid-900.woff2) format('woff2');
    font-weight: 900;
  }

  .circular-bar-chart {
    --vis-circular-bar-icon-font-family: 'Font Awesome 6 Free';
    --vis-circular-bar-icon-font-weight: 900;
  }
</style>
