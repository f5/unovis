<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Plotband, PlotbandConfigInterface } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // config
  let prevConfig: PlotbandConfigInterface<Datum>
  let config: PlotbandConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Plotband<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Plotband<Datum>(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Plotband<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

