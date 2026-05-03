<script setup lang="ts" generic="T">
import { SingleContainer, ComponentCore, SingleContainerConfigInterface, SingleContainerRenderPayload, Tooltip, Annotations } from '@unovis/ts'
import { onUnmounted, ref, shallowRef, provide, watch, toRefs, watchEffect, shallowReactive, toRaw } from 'vue'
import { annotationsAccessorKey, componentAccessorKey, tooltipAccessorKey,  } from "../../utils/context"
import { useForwardProps } from "../../utils/props"

const props = defineProps<SingleContainerConfigInterface<T> & { data?: T }>()
const emit = defineEmits<{
  load: [payload: SingleContainerRenderPayload];
  render: [payload: SingleContainerRenderPayload];
  redraw: [payload: SingleContainerRenderPayload];
}>()

const { data } = toRefs(props)
const parsedProps = useForwardProps(props)

// `shallowRef` / `shallowReactive` keep the unovis instances raw: deep-proxying them
// adds overhead on hot render paths and is not needed because child components
// explicitly notify the container about their updates via `dirty()`
const chart = shallowRef<SingleContainer<T>>()
const config = shallowReactive({
  component: undefined,
  tooltip: undefined,
  annotations: undefined,
}) as SingleContainerConfigInterface<T>
const elRef = ref<HTMLDivElement>()

let hasLoaded = false
const handleRenderComplete: SingleContainerConfigInterface<T>['onRenderComplete'] = (svg, margin, containerWidth, containerHeight, componentWidth, componentHeight) => {
  parsedProps.value.onRenderComplete?.(svg, margin, containerWidth, containerHeight, componentWidth, componentHeight)
  const payload: SingleContainerRenderPayload = { svg, margin, containerWidth, containerHeight, componentWidth, componentHeight }
  emit('render', payload)
  if (hasLoaded) {
    emit('redraw', payload)
  } else {
    hasLoaded = true
    emit('load', payload)
  }
}

const initChart = () => {
  if (chart.value) return
  if (elRef.value && config.component)
    chart.value = new SingleContainer(elRef.value, { ...toRaw(config), onRenderComplete: handleRenderComplete }, data.value)
}

// Child components call this after updating their data or config, so the chart re-renders.
// The render is scheduled on the next animation frame by the core, so multiple updates get batched
const dirty = () => { chart.value?.render() }

watchEffect(() => {
  initChart()
  // Spreading `config` (shallow-reactive) tracks child component registrations
  chart.value?.updateContainer({ ...toRaw(parsedProps.value), ...config, onRenderComplete: handleRenderComplete })
})

watch(data, () => {
  if (data.value === undefined) return
  if (chart.value) chart.value.setData(data.value)
  else initChart()
})

onUnmounted(() => chart.value?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: ComponentCore<T>) => config.component = c,
  destroy: () => config.component = undefined,
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
  <div data-vis-single-container ref="elRef" class='unovis-single-container'>
    <slot />
  </div>
</template>



<style>
.unovis-single-container {
  display: block;
  position: relative;
  width: 100%;
}
</style>
