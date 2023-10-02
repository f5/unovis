<script setup lang="ts" generic="Datum extends GenericDataRecord">
// !!! This code was automatically generated. You should not change it !!!
import { LeafletMap, LeafletMapConfigInterface, GenericDataRecord, MapLibreStyleSpecs } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'


// data and required props
const props = defineProps<LeafletMapConfigInterface<Datum> & { data?: Datum[] }>()
const data = computed(() => props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

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

<template>
  <div data-vis-leaflet-map ref="elRef"/>
</template>


<style>
  [data-vis-leaflet-map] {
    display:block;
    position:relative;
  }
</style>
