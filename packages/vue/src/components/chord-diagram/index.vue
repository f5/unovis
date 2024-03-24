<script setup lang="ts" generic="N extends ChordInputNode,L extends ChordInputLink">
// !!! This code was automatically generated. You should not change it !!!
import { ChordDiagram, ChordDiagramConfigInterface, ChordInputNode, ChordInputLink } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props 
type Props = ChordDiagramConfigInterface<N, L>
const props = defineProps<Props & { data?: { nodes: N[]; links?: L[] } }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<ChordDiagram<N, L>>()


onMounted(() => {
  nextTick(() => {
    component.value = new ChordDiagram<N, L>(config.value)
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
  }
})

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component
})
</script>

<script lang="ts">
export const VisChordDiagramSelectors = ChordDiagram.selectors
</script>

<template>
  <div data-vis-component />
</template>


