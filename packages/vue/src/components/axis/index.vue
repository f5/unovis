<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { AxisConfigInterface } from '@unovis/ts'
import { Axis } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { axisAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: Datum[] }>()

const accessor = inject(axisAccessorKey, undefined)

// data and required props
type Props = AxisConfigInterface<Datum>
const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<Axis<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Axis<Datum>(config.value)
    component.value?.setData(data.value)
    accessor?.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor?.destroy(props.type)
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
export const VisAxisSelectors = Axis.selectors
</script>

<template>
  <div data-vis-axis />
</template>
