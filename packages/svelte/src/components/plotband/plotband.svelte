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
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new Plotband<Datum>(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
    dirty?.()
  }

  // component accessor
  export function getComponent (): Plotband<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

