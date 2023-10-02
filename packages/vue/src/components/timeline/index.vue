<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { Timeline, TimelineConfigInterface, NumericAccessor } from '@unovis/ts'
import { XYComponentConfigInterface, StringAccessor } from "@unovis/ts"
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick, inject } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props
// complex interface TimelineConfigInterface is causing compile issue in Vue 3.3.4
  // related issue: https://github.com/vuejs/core/issues/8412
  const props = defineProps<XYComponentConfigInterface<Datum> & {
    lineWidth?: NumericAccessor<Datum>;
    lineCap?: boolean;
    rowHeight?: number;
    length?: NumericAccessor<Datum>;
    type?: StringAccessor<Datum>;
    cursor?: StringAccessor<Datum>;
    showLabels?: boolean;
    labelWidth?: number;
    maxLabelWidth?: number;
    alternatingRowColors?: boolean;
    onScroll?: (scrollTop: number) => void;
    showEmptySegments?: boolean;
    data?: Datum[]
  }>()
const data = computed(() => accessor.data.value ?? props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

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
  }
})

defineExpose({
  component
})
</script>

<template>
  <div data-vis-component />
</template>


