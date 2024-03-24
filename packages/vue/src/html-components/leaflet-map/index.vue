<script setup lang="ts" generic="Datum extends GenericDataRecord">
// !!! This code was automatically generated. You should not change it !!!
import { LeafletMap, LeafletMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'


// data and required props 
type Props = LeafletMapConfigInterface<Datum>
const props = defineProps<Props & { data?: Datum[] }>()

const data = computed(() => props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<LeafletMap<Datum>>()
const elRef = ref<HTMLDivElement>()

onMounted(() => {
  nextTick(() => {
    if(elRef.value)
    component.value = new LeafletMap<Datum>(elRef.value, config.value, data.value)
    
    
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
export const VisLeafletMapSelectors = LeafletMap.selectors
</script>

<template>
  <div data-vis-leaflet-map ref="elRef"/>
</template>


<style>
  [data-vis-leaflet-map] {
    display:block;
    position:relative;
  }
</style>
