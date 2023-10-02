<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { Timeline, TimelineConfigInterface, NumericAccessor } from '@unovis/ts'
import { XYComponentConfigInterface, StringAccessor } from "@unovis/ts"
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { componentAccessorKey } from '../../utils/context'

const accessor = inject(componentAccessorKey)

// data and required props 
// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412
interface Props extends /** @vue-ignore */ TimelineConfigInterface<Datum> { }
const props = defineProps<Props & { data?: Datum[] }>()

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


