<script setup lang="ts" generic="T">
import { XYContainer, XYComponentCore, XYContainerConfigInterface, Tooltip, Crosshair, Axis, Annotations } from '@unovis/ts'
import { onUnmounted, ref, provide, watch, toRefs, reactive, watchEffect, toRaw } from 'vue'
import { componentAccessorKey, tooltipAccessorKey, axisAccessorKey, crosshairAccessorKey, annotationsAccessorKey } from "../../utils/context"
import { useForwardProps } from "../../utils/props"

const props = defineProps<XYContainerConfigInterface<T> & { data?: T[] }>()
const { data } = toRefs(props)
const parsedProps = useForwardProps(props)

const chart = ref<XYContainer<T>>()
const config = reactive({
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

watchEffect(() => {
  initChart()
  // touch deep changes in components config to track them
  const t = config.components.map(i => i.config)
  chart.value?.updateContainer({ ...toRaw(parsedProps.value), ...toRaw(config) })
})

watch(data, () => {
  if (chart.value) chart.value.setData(data.value, true)
  else initChart()
})

onUnmounted(() => chart.value?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: XYComponentCore<T>) => config.components = [...config.components!, c],
  destroy: () => config.components = config.components?.filter(c => !c.isDestroyed()),
})

provide(axisAccessorKey, {
  data,
  update: (c: Axis<T>) => config[`${c.config.type}Axis`] = c,
  destroy: (c) => { config[`${c}Axis`] = undefined },
})

provide(crosshairAccessorKey, {
  data,
  update: (c: Crosshair<T>) => config.crosshair = c,
  destroy: () => { config.crosshair = undefined },
})

provide(tooltipAccessorKey, {
  data,
  update: (t: Tooltip) => config.tooltip = t,
  destroy: () => { config.tooltip = undefined },
})

provide(annotationsAccessorKey, {
  data,
  update: (a: Annotations) => config.annotations = a,
  destroy: () => { config.annotations = undefined },
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
