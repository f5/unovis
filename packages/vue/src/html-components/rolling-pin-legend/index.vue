<script setup lang="ts" >
// !!! This code was automatically generated. You should not change it !!!
import { RollingPinLegend, RollingPinLegendConfigInterface, RollingPinLegendItem } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'


// data and required props 
type Props = RollingPinLegendConfigInterface
const props = defineProps<Props & { data?: null }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<RollingPinLegend>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if(elRef.value)
    component.value = new RollingPinLegend(elRef.value, config.value)
    
    
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

<script lang="ts">
export const VisRollingPinLegendSelectors = RollingPinLegend.selectors
</script>

<template>
  <div data-vis-rolling-pin-legend ref="elRef"/>
</template>


<style>
  [data-vis-rolling-pin-legend] {
    display:block;
  }
</style>
