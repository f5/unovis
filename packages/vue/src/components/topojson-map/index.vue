<script setup lang="ts" generic="AreaDatum, PointDatum, LinkDatum">
// !!! This code was automatically generated. You should not change it !!!
import type { TopoJSONMapConfigInterface } from '@unovis/ts'
import { TopoJSONMap } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: { areas?: AreaDatum[], points?: PointDatum[], links?: LinkDatum[] } }>()

const accessor = inject(componentAccessorKey, undefined)

// data and required props
type Props = TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum>
const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config.value)
    component.value?.setData(data.value)
    accessor?.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor?.destroy()
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
    // Notify the container so it can re-render the chart
    accessor?.dirty()
  }
})

watch(data, () => {
  component.value?.setData(data.value)
  // Notify the container so it can re-render the chart
  accessor?.dirty()
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisTopoJSONMapSelectors = TopoJSONMap.selectors
</script>

<template>
  <div data-vis-component />
</template>
