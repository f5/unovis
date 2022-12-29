<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { FreeBrush, FreeBrushConfigInterface } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: FreeBrushConfigInterface<Datum>
  let config: FreeBrushConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  const component = new FreeBrush<Datum>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): FreeBrush<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

