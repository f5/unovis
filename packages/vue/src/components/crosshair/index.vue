<script setup lang="ts" generic="Datum">
// !!! This code was automatically generated. You should not change it !!!
import { Crosshair, CrosshairConfigInterface, NumericAccessor } from '@unovis/ts'
import { onMounted, onUnmounted, computed, ref, watch, nextTick, inject } from 'vue'
import { arePropsEqual, useForwardProps } from '../../utils/props'
import { crosshairAccessorKey } from '../../utils/context'

const accessor = inject(crosshairAccessorKey)

// data and required props 
// !!! temporary solution to ignore complex type. related issue: https://github.com/vuejs/core/issues/8412
type Props = /** @vue-ignore */ CrosshairConfigInterface<Datum>
const props = defineProps<Props & { data?: Datum[] }>()

const data = computed(() => accessor.data.value ?? props.data)
// config
const config = useForwardProps(props)

// component declaration
const component = ref<Crosshair<Datum>>()


onMounted(() => {
  nextTick(() => {
    component.value = new Crosshair<Datum>(config.value)
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

<script lang="ts">
export const VisCrosshairSelectors = Crosshair.selectors
</script>

<template>
  <div data-vis-crosshair />
</template>


