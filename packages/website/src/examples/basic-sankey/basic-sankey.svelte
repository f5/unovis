<script lang='ts'>
  import { FitMode } from '@volterra/vis'
  import { VisSingleContainer, VisSankey } from '@volterra/vis-svelte'
  import { data, NodeDatum } from './data'

  const subLabel = (d: NodeDatum) => `£${d.value.toFixed(2)}`
</script>

<VisSingleContainer {data} height={400}>
  <VisSankey
    labelFit={FitMode.Wrap}
    labelForceWordBreak={false}
    labelMaxWidth={150}
    nodePadding={20}
    {subLabel}
  />
</VisSingleContainer>
