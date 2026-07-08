<script setup lang="ts" generic="N extends SankeyInputNode, L extends SankeyInputLink">
// !!! This code was automatically generated. You should not change it !!!
import type { SankeyConfigInterface, SankeyInputLink, SankeyInputNode } from '@unovis/ts'
import { Sankey } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: { nodes: N[], links?: L[] } }>()

const accessor = inject(componentAccessorKey, undefined)

// data and required props
type Props = SankeyConfigInterface<N, L>
const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<Sankey<N, L>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Sankey<N, L>(config.value)
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
export const VisSankeySelectors = Sankey.selectors
</script>

<template>
  <div data-vis-component />
</template>
