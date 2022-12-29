<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Crosshair, CrosshairConfigInterface } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: CrosshairConfigInterface<Datum>
  let config: CrosshairConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  const component = new Crosshair<Datum>(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Crosshair<Datum> { return component }

</script>

<vis-crosshair use:lifecycle={component}/>

