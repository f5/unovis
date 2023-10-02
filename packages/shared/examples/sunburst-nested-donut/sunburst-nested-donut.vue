<script setup lang="ts">
import { VisSingleContainer, VisNestedDonut } from '@unovis/vue'
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

<template>
  <VisSingleContainer :data="data" class="sunburst">
    <VisNestedDonut direction="outwards" :hideOverflowingSegmentLabels="false" :layerSettings="{ width: '6vmin' }"
      :layers="layers" :segmentColor="segmentColor" />
  </VisSingleContainer>
</template>

<style>
.sunburst {
  height: 60vmin;
  --vis-nested-donut-segment-label-font-size: 1vmin;
}
</style>
