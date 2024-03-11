<script setup lang="ts" generic="T">
import { SingleContainer, ComponentCore, SingleContainerConfigInterface, Tooltip, Annotations } from '@unovis/ts'
import { onUnmounted, ref, provide, watch, toRefs, watchEffect, reactive, toRaw } from 'vue'
import { annotationsAccessorKey, componentAccessorKey, tooltipAccessorKey,  } from "../../utils/context"
import { useForwardProps } from "../../utils/props"

const props = defineProps<SingleContainerConfigInterface<T> & { data?: T }>()
const { data } = toRefs(props)
const parsedProps = useForwardProps(props)

let chart: SingleContainer<T>
const config = reactive({
  component: undefined,
  tooltip: undefined,
  annotations: undefined,
}) as SingleContainerConfigInterface<T>
const elRef = ref<HTMLDivElement>()

const initChart = () => {
  if (chart) return
  if (elRef.value && config.component)
    chart = new SingleContainer(elRef.value, { ...toRaw(config) }, data.value)
}

watchEffect(() => {
  initChart()
  // watch deep changes in components config
  const t = config.component?.config
  chart?.updateContainer({ ...toRaw(parsedProps.value), ...toRaw(config) })
})

watch(data, () => {
  if (chart) {
    chart.setData(data.value, true)
  } else {
    initChart()
  }
})

onUnmounted(() => chart?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: ComponentCore<T>) => config.component = c,
  destroy: () => config.component = undefined,
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
