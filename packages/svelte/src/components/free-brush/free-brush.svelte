<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { FreeBrush, FreeBrushConfigInterface } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'
  
  import type { Lifecycle } from '../../types/context'
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
  let component: FreeBrush<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new FreeBrush<Datum>(config)
    return () => component?.destroy()
    })
  $: component?.setData(data)
  $: if(!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): FreeBrush<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

