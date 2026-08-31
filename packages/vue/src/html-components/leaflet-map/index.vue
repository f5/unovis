<script setup lang="ts" generic="Datum extends GenericDataRecord">
// !!! This code was automatically generated. You should not change it !!!
import type { GenericDataRecord, LeafletMapConfigInterface } from '@unovis/ts'
import { LeafletMap } from '@unovis/ts'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'

// data and required props
type Props = LeafletMapConfigInterface<Datum>
const props = defineProps<Props & { data?: Datum[] }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<LeafletMap<Datum>>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if (elRef.value)
      component.value = new LeafletMap<Datum>(elRef.value, config.value, data.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
    component.value?.render()
  }
})

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisLeafletMapSelectors = LeafletMap.selectors
</script>

<template>
  <div ref="elRef" data-vis-leaflet-map />
</template>

<style>
  [data-vis-leaflet-map] {
    display:block;
    position:relative;
  }
</style>
