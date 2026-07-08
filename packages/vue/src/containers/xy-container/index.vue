<script setup lang="ts" generic="T">
import { XYContainer, XYComponentCore, XYContainerConfigInterface, Tooltip, Crosshair, Axis, Annotations } from '@unovis/ts'
import { onUnmounted, ref, shallowRef, provide, watch, toRefs, shallowReactive, watchEffect, toRaw } from 'vue'
import { componentAccessorKey, tooltipAccessorKey, axisAccessorKey, crosshairAccessorKey, annotationsAccessorKey } from "../../utils/context"
import { useForwardProps } from "../../utils/props"

const props = defineProps<XYContainerConfigInterface<T> & { data?: T[] }>()
const { data } = toRefs(props)
const parsedProps = useForwardProps(props)

// `shallowRef` / `shallowReactive` keep the unovis instances raw: deep-proxying them
// adds overhead on hot render paths and is not needed because child components
// explicitly notify the container about their updates via `dirty()`
const chart = shallowRef<XYContainer<T>>()
const config = shallowReactive({
  components: [],
  annotations: undefined,
  crosshair: undefined,
  tooltip: undefined,
  xAxis: undefined,
  yAxis: undefined,
}) as XYContainerConfigInterface<T>
const elRef = ref<HTMLDivElement>()

const initChart = () => {
  if (chart.value || !elRef.value) return
  // config holds only child-registration slots — if all are empty, no slot has registered yet
  const hasContent = Object.values(config).some(v => Array.isArray(v) ? v.length : v)
  if (!hasContent) return
  chart.value = new XYContainer(elRef.value, { ...toRaw(config) }, data.value)
}

// Child components call this after updating their data or config, so the chart re-renders.
// The render is scheduled on the next animation frame by the core, so multiple updates get batched
const dirty = () => { chart.value?.render() }

watchEffect(() => {
  initChart()
  // Spreading `config` (shallow-reactive) tracks child component registrations
  chart.value?.updateContainer({ ...toRaw(parsedProps.value), ...config })
})

watch(data, () => {
  if (chart.value) chart.value.setData(data.value)
  else initChart()
})

onUnmounted(() => chart.value?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: XYComponentCore<T>) => config.components = [...config.components!, c],
  destroy: () => config.components = config.components?.filter(c => !c.isDestroyed()),
  dirty,
})

provide(axisAccessorKey, {
  data,
  update: (c: Axis<T>) => config[`${c.config.type}Axis`] = c,
  destroy: (c) => { config[`${c}Axis`] = undefined },
  dirty,
})

provide(crosshairAccessorKey, {
  data,
  update: (c: Crosshair<T>) => config.crosshair = c,
  destroy: () => { config.crosshair = undefined },
  dirty,
})

provide(tooltipAccessorKey, {
  data,
  update: (t: Tooltip) => config.tooltip = t,
  destroy: () => { config.tooltip = undefined },
  dirty,
})

provide(annotationsAccessorKey, {
  data,
  update: (a: Annotations) => config.annotations = a,
  destroy: () => { config.annotations = undefined },
  dirty,
})

defineExpose({
  component: chart
})
</script>

<template>
  <div data-vis-xy-container ref="elRef" class='unovis-xy-container'>
    <slot />
  </div>
</template>


<style>
.unovis-xy-container {
  display: block;
  position: relative;
  width: 100%;
}
</style>
