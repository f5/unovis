<script lang='ts'>
  import { VisSingleContainer, VisNestedDonut } from '@unovis/svelte'
  import { NestedDonutSegment } from '@unovis/ts'
  import { colors, data, Datum } from './data'

  const layers = [
    (d: Datum) => d.type,
    (d: Datum) => d.group,
    (d: Datum) => d.subgroup,
    (d: Datum) => d.description,
    (d: Datum) => d.item,
  ]
  const segmentColor = (d: NestedDonutSegment<Datum>) => colors.get(d.data.key)
</script>

<VisSingleContainer data={data} height={1000}>
  <VisNestedDonut
    direction='outwards'
    hideSegmentLabels={false}
    layerSettings={{
      width: 100,
      rotateLabels: true,
    }}
    {layers}
    {segmentColor}/>
</VisSingleContainer>
