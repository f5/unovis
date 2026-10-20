<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Axis as AxisCore } from '@unovis/ts/components/axis'
  import type { AxisConfigInterface } from '@unovis/ts/components/axis/config'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: AxisConfigInterface<Datum>
  let config: AxisConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: AxisCore<Datum>
  const lifecycle = getContext<Lifecycle>('axis')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new AxisCore<Datum>(config)
    return () => component?.destroy()
  })
  $: if (data !== undefined) { component?.setData(data); dirty?.() }
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): AxisCore<Datum> { return component }

</script>

<vis-axis use:lifecycle={component}></vis-axis>

