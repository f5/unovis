<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { AxisConfigInterface } from '@unovis/ts'
import { Axis } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { axisAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: Datum[] }>()

const accessor = inject(axisAccessorKey)

// data and required props
type Props = AxisConfigInterface<Datum>
const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Axis<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Axis<Datum>(config.value)
    component.value?.setData(data.value)
    accessor.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor.destroy(props.type)
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
export const VisAxisSelectors = Axis.selectors
</script>

<template>
  <div data-vis-axis />
</template>
