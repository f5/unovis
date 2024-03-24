<script setup lang="ts" >
// !!! This code was automatically generated. You should not change it !!!
import { BulletLegend, BulletLegendConfigInterface, BulletLegendItemInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'


// data and required props 
type Props = BulletLegendConfigInterface
const props = defineProps<Props & { data?: null }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<BulletLegend>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if(elRef.value)
    component.value = new BulletLegend(elRef.value, config.value)
    
    
  })
})

onUnmounted(() => {
  component.value?.destroy()
  
})

watch(config, (curr, prev) => {
  if (!arePropsEqual(curr, prev)) {
    component.value?.update(config.value)
  }
})


defineExpose({
  component
})
</script>

<script lang="ts">
export const VisBulletLegendSelectors = BulletLegend.selectors
</script>

<template>
  <div data-vis-bullet-legend ref="elRef"/>
</template>


<style>
  [data-vis-bullet-legend] {
    display:block;
  }
</style>
