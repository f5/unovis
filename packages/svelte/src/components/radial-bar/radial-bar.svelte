<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { RadialBar as RadialBarCore } from '@unovis/ts/components/radial-bar'
  import type { RadialBarConfigInterface } from '@unovis/ts/components/radial-bar/config'
  import type { NumericAccessor } from '@unovis/ts/types/accessor'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let value: NumericAccessor<Datum>

  // config
  let prevConfig: RadialBarConfigInterface<Datum>
  let config: RadialBarConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  // component declaration
  let component: RadialBarCore<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new RadialBarCore<Datum>(config)
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
  export function getComponent (): RadialBarCore<Datum> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

