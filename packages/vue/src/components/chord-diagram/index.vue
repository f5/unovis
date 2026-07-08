<script setup lang="ts" generic="N extends ChordInputNode, L extends ChordInputLink">
// !!! This code was automatically generated. You should not change it !!!
import type { ChordDiagramConfigInterface, ChordInputLink, ChordInputNode } from '@unovis/ts'
import { ChordDiagram } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

const props = defineProps<Props & { data?: { nodes: N[], links?: L[] } }>()

const accessor = inject(componentAccessorKey, undefined)

// data and required props
type Props = ChordDiagramConfigInterface<N, L>
const data = computed(() => accessor?.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
// (a shallow ref keeps the unovis instance raw — deep-proxying it adds overhead and is not needed)
const component = shallowRef<ChordDiagram<N, L>>()

onMounted(() => {
  nextTick(() => {
    component.value = new ChordDiagram<N, L>(config.value)
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
export const VisChordDiagramSelectors = ChordDiagram.selectors
</script>

<template>
  <div data-vis-component />
</template>
