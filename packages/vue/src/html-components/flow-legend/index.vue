<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { FlowLegend, FlowLegendConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
interface Props extends /** @vue-ignore */ FlowLegendConfigInterface { }
export const VisFlowLegendSelectors = FlowLegend.selectors
</script>

<script setup lang="ts" >

const props = defineProps<Props & { data?: null }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<FlowLegend>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if(elRef.value)
    component.value = new FlowLegend(elRef.value, { ...config.value, renderIntoProvidedDomNode: true })
    
    
  })
})

onUnmounted(() => {
  component.value?.destroy()
  
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.setConfig(config.value)
  }
})


defineExpose({
  component
})
</script>

<template>
  <div data-vis-flow-legend ref="elRef"/>
</template>


<style>
  [data-vis-flow-legend] {
    display:block;
  }
</style>
