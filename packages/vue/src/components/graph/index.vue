<script setup lang="ts" generic="N extends GraphInputNode,L extends GraphInputLink">
// !!! This code was automatically generated. You should not change it !!!
import { Graph, GraphConfigInterface, GraphInputNode, GraphInputLink } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props 
interface Props extends  GraphConfigInterface<N, L> { }
const props = defineProps<Props & { data?: { nodes: N[]; links?: L[] } }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Graph<N, L>>()


onMounted(() => {
  nextTick(() => {
    component.value = new Graph<N, L>(config.value)
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

<template>
  <div data-vis-component />
</template>


