<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { Axis, AxisConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, getCurrentInstance, nextTick, inject } from 'vue'
import { arePropsEqual, parseProps } from '../../utils/props'
import { axisAccessorKey } from '../../utils/context'

const accessor = inject(axisAccessorKey)

// data and required props
const props = defineProps<AxisConfigInterface<Datum> & { data?: Datum[] }>()
const data = computed(() => accessor.data.value ?? props.data)
// config
const instance = getCurrentInstance()
const config = computed(() => parseProps({ ...props }, instance))

// component declaration
const component = ref<Axis<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new Axis<Datum>(config.value)
    component.value?.setData(data.value)
    accessor.update(component.value)
  })
})

onUnmounted(() => {
  component.value?.destroy()
  accessor.destroy(props.type)
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
  <div data-vis-axis />
</template>


