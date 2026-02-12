<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { LeafletFlowMap, LeafletFlowMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
interface Props<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> extends /** @vue-ignore */ LeafletFlowMapConfigInterface<PointDatum, FlowDatum> { }
export const VisLeafletFlowMapSelectors = LeafletFlowMap.selectors
</script>

<script setup lang="ts" generic="PointDatum extends GenericDataRecord,FlowDatum extends GenericDataRecord">

const props = defineProps<Props<PointDatum, FlowDatum> & { data?: { points: PointDatum[]; flows?: FlowDatum[] } }>()

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

watch(data, () => {
  component.value?.setData(data.value)
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
