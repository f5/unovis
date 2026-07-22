<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import type { TimelineConfigInterface } from '@unovis/ts'
import { Timeline } from '@unovis/ts'
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { componentAccessorKey } from '../../utils/context'
import { arePropsEqual, useForwardProps } from '../../utils/props'

// data and required props
// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412
const props = defineProps<{ data?: Datum[] } & /** @vue-ignore */ TimelineConfigInterface<Datum>>()

const accessor = inject(componentAccessorKey)

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Timeline<Datum>>()

onMounted(() => {
  nextTick(() => {
    component.value = new Timeline<Datum>(config.value)
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
    component.value?.render()
  }
})

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component,
})
</script>

<script lang="ts">
export const VisTimelineSelectors = Timeline.selectors
</script>

<template>
  <div data-vis-component />
</template>
