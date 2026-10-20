<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Plotline as PlotlineCore } from '@unovis/ts/components/plotline'
  import type { PlotlineConfigInterface } from '@unovis/ts/components/plotline/config'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // config
  let prevConfig: PlotlineConfigInterface<Datum>
  let config: PlotlineConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: PlotlineCore<Datum>
  const lifecycle = getContext<Lifecycle>('component')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new PlotlineCore<Datum>(config)
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
  export function getComponent (): PlotlineCore<Datum> { return component }

</script>

<vis-component use:lifecycle={component}></vis-component>

