<script setup lang="ts" generic="PointDatum extends GenericDataRecord,FlowDatum extends GenericDataRecord">
// !!! This code was automatically generated. You should not change it !!!
import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'


// data and required props 
type Props = LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
const props = defineProps<Props & { data?: { points: PointDatum[]; flows?: FlowDatum[] } }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

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

<script lang="ts">
export const VisLeafletFlowMapSelectors = LeafletFlowMap.selectors
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
