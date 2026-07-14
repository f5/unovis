<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { HeatmapConfigInterface } from '@unovis/ts'
import { Heatmap } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: Datum[] }>()

const accessor = inject(componentAccessorKey)

// data and required props
type Props = HeatmapConfigInterface<Datum>
const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Heatmap<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Heatmap<Datum>(config.value)
    component.value?.setData(data.value)
    accessor.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor.destroy()
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
export const VisHeatmapSelectors = Heatmap.selectors
</script>

<template>
  <div data-vis-component />
</template>
