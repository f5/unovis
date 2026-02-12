<script lang="ts">
// !!! This code was automatically generated. You should not change it !!!
import { Axis, AxisConfigInterface } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { axisAccessorKey } from '../../utils/context'
interface Props<Datum> extends /** @vue-ignore */ AxisConfigInterface<Datum> { }
export const VisAxisSelectors = Axis.selectors
</script>

<script setup lang="ts" generic="Datum">
const accessor = inject(axisAccessorKey)

const props = defineProps<Props<Datum> & { data?: Datum[] }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

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

watch(data, () => {
  component.value?.setData(data.value)
})

defineExpose({
  component
})
</script>

<template>
  <div data-vis-axis />
</template>


