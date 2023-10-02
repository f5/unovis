<script setup lang="ts" generic="PointDatum extends GenericDataRecord,FlowDatum extends GenericDataRecord">
// !!! This code was automatically generated. You should not change it !!!
import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'


// data and required props
const props = defineProps<LeafletFlowMapConfigInterface<PointDatum, FlowDatum> & { data?: { points: PointDatum[]; flows?: FlowDatum[] } }>()
const data = computed(() => props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

// component declaration
const component = ref<LeafletFlowMap<PointDatum, FlowDatum>>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if(elRef.value)
    component.value = new LeafletFlowMap<PointDatum, FlowDatum>(elRef.value, config.value, data.value)
    
    
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
  <div data-vis-leaflet-flow-map ref="elRef"/>
</template>


<style>
  [data-vis-leaflet-flow-map] {
    display:block;
    position:relative;
  }
</style>
