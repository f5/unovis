<script lang="ts">
  import { VisSingleContainer, VisRadialBar, VisTooltip, VisBulletLegend } from '@unovis/svelte'
  import { RadialBar } from '@unovis/ts'
  import type { RadialBarArcDatum } from '@unovis/ts'
  import type { DataRecord } from './data'
  import { data, maxValue, completion } from './data'

  const legendItems = data.map(d => ({ name: d.key }))

  const triggers = {
    [RadialBar.selectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
      const max = maxValue[d.index] ?? '—'
      return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
    },
  }
</script>

<VisBulletLegend items={legendItems}/>
<VisSingleContainer height={400}>
  <VisRadialBar
    value={d => d.value}
    {data}
    maxValue={maxValue}
    trackWidth={18}
    trackPadding={4}
    cornerRadius={9}
    centralLabel={`${completion}%`}
    centralSubLabel="daily goals"
  />
  <VisTooltip {triggers}/>
</VisSingleContainer>
