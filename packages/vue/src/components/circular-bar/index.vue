<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { CircularBarConfigInterface } from '@unovis/ts'
import { CircularBar } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: Datum[] }>()

const accessor = inject(componentAccessorKey)

// data and required props
type Props = CircularBarConfigInterface<Datum>
const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<CircularBar<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new CircularBar<Datum>(config.value)
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
export const VisCircularBarSelectors = CircularBar.selectors
</script>

<template>
  <div data-vis-component />
</template>
