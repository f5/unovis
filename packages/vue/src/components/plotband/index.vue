<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { Plotband, PlotbandConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'
interface Props<Datum> extends /** @vue-ignore */ PlotbandConfigInterface<Datum> { }
export const VisPlotbandSelectors = Plotband.selectors
</script>

<script setup lang="ts" generic="Datum">
const accessor = inject(componentAccessorKey)

const props = defineProps<Props<Datum> & { data?: null }>()


// config
const config = useForwardProps(props)

// component declaration
const component = ref<Plotband<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new Plotband<Datum>(config.value)
    
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


defineExpose({
  component
})
</script>

<template>
  <div data-vis-component />
</template>


