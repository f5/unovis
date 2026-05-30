<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { RadialBar, RadialBarConfigInterface, NumericAccessor } from '@unovis/ts'
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
  let component: RadialBar<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new RadialBar<Datum>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): RadialBar<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

