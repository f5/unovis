<script setup lang="ts" generic="T">
import { SingleContainer, ComponentCore, SingleContainerConfigInterface, Tooltip } from '@unovis/ts'
import { onUnmounted, ref, provide, watch, toRefs, getCurrentInstance, computed, watchEffect, Ref, onMounted } from 'vue'
import { componentAccessorKey, tooltipAccessorKey } from "../../utils/context"
import { parseProps } from "../../utils/props"

const props = defineProps<SingleContainerConfigInterface<T> & { data?: T }>()
const { data } = toRefs(props)
const instance = getCurrentInstance()
const parsedProps = computed(() => parseProps({ ...props }, instance))

const chart = ref<SingleContainer<T> | undefined>()
const config = ref({
  component: undefined,
  tooltip: undefined,
}) as Ref<SingleContainerConfigInterface<T>>
const elRef = ref<HTMLDivElement>()

const initChart = () => {
  if (chart.value) return
  if (elRef.value && config.value.component)
    chart.value = new SingleContainer(elRef.value, config.value, data.value)
}

watchEffect(() => {
  initChart()
  chart.value?.updateContainer({ ...parsedProps.value, ...config.value })
})

watch(data, () => {
  if (chart.value) {
    chart.value.setData(data.value, true)
  } else {
    initChart()
  }
})

onUnmounted(() => chart.value?.destroy())

provide(componentAccessorKey, {
  data,
  update: (c: ComponentCore<T>) => config.value.component = c,
  destroy: () => config.value.component = undefined,
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
