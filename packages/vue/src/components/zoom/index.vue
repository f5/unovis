<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!

import type { ZoomConfigInterface } from '@unovis/ts/components/zoom/config'
import { Zoom } from '@unovis/ts/components/zoom'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { zoomAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

// data and required props
// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412
const props = defineProps<{ data?: Datum[] } & /** @vue-ignore */ ZoomConfigInterface<Datum>>()

const accessor = inject(zoomAccessorKey, undefined)

const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<Zoom<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Zoom<Datum>(config.value)
    if (data.value !== undefined)
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
  if (data.value === undefined)
    return
  component.value?.setData(data.value)
  // Notify the container so it can re-render the chart
  accessor?.dirty()
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisZoomSelectors = Zoom.selectors
</script>

<template>
  <div data-vis-zoom />
</template>
