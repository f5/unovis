<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { TopoJSONMap, TopoJSONMapConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'
interface Props<AreaDatum, PointDatum, LinkDatum> extends /** @vue-ignore */ TopoJSONMapConfigInterface<AreaDatum, PointDatum, LinkDatum> { }
export const VisTopoJSONMapSelectors = TopoJSONMap.selectors
</script>

<script setup lang="ts" generic="AreaDatum,PointDatum,LinkDatum">
const accessor = inject(componentAccessorKey)

const props = defineProps<Props<AreaDatum, PointDatum, LinkDatum> & { data?: {areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[]} }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<TopoJSONMap<AreaDatum, PointDatum, LinkDatum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new TopoJSONMap<AreaDatum, PointDatum, LinkDatum>(config.value)
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


