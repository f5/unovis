<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { NestedDonut, NestedDonutConfigInterface, StringAccessor } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let layers: StringAccessor<Datum>[]

  // config
  let prevConfig: NestedDonutConfigInterface<Datum>
  let config: NestedDonutConfigInterface<Datum>
  $: config = { layers, ...$$restProps }

  // component declaration
  const component = new NestedDonut<Datum>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): NestedDonut<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

