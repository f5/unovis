<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { CrosshairConfigInterface } from '@unovis/ts'
import { Crosshair } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { crosshairAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

// data and required props
// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412
const props = defineProps</** @vue-ignore */ CrosshairConfigInterface<Datum> & { data?: Datum[] }>()

const accessor = inject(crosshairAccessorKey, undefined)

const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<Crosshair<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Crosshair<Datum>(config.value)
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
export const VisCrosshairSelectors = Crosshair.selectors
</script>

<template>
  <div data-vis-crosshair />
</template>
