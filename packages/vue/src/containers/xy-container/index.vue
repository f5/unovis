<script setup lang="ts" generic="T">
import { XYContainer, XYComponentCore, XYContainerConfigInterface, Tooltip, Crosshair, Axis } from '@unovis/ts'
import { onMounted, onUnmounted, ref, provide, watch, toRefs, getCurrentInstance, computed, reactive, watchEffect, shallowRef, Ref } from 'vue'
import { componentAccessorKey, tooltipAccessorKey, axisAccessorKey, crosshairAccessorKey } from "../../utils/context"
import { parseProps } from "../../utils/props"

const props = defineProps<XYContainerConfigInterface<T> & { data?: T[] }>()
const { data } = toRefs(props)
const instance = getCurrentInstance()
const parsedProps = computed(() => parseProps({ ...props }, instance))

const chart = ref<XYContainer<T> | undefined>()
const config = ref({
  components: [],
  crosshair: undefined,
  tooltip: undefined,
  xAxis: undefined,
  yAxis: undefined,
}) as Ref<XYContainerConfigInterface<T>>
const elRef = ref<HTMLDivElement>()

watch(data, () => {
  if (chart.value) {
    chart.value.setData(data.value, true)
  }
})

watchEffect(() => {
  chart.value?.updateContainer({ ...parsedProps.value, ...config.value })
})

onMounted(() => {
  if (elRef.value) chart.value = new XYContainer(elRef.value, config.value, data.value)
})

onUnmounted(() => chart.value?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: XYComponentCore<T>) => config.value.components = [...config.value.components!, c],
  destroy: () => config.value.components = config.value.components?.filter(c => !c.isDestroyed()),
})

provide(axisAccessorKey, {
  data,
  update: (c: Axis<T>) => config.value[`${c.config.type}Axis`] = c,
  destroy: (c) => { config.value[`${c}Axis`] = undefined },
})

provide(crosshairAccessorKey, {
  data,
  update: (c: Crosshair<T>) => config.value.crosshair = c,
  destroy: () => { config.value.crosshair = undefined },
})

provide(tooltipAccessorKey, {
  data,
  update: (t: Tooltip) => config.value.tooltip = t,
  destroy: () => { config.value.tooltip = undefined },
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
