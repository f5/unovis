<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Plotband as PlotbandCore } from '@unovis/ts/components/plotband'
  import type { PlotbandConfigInterface } from '@unovis/ts/components/plotband/config'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: PlotbandCore<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new PlotbandCore<Datum>(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): PlotbandCore<Datum> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

