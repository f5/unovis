<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip as TooltipCore } from '@unovis/ts/components/tooltip'
  import type { TooltipConfigInterface } from '@unovis/ts/components/tooltip/config'
  import { cloneDeep } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: TooltipConfigInterface
  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: TooltipCore
  const lifecycle = getContext<Lifecycle>('tooltip')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new TooltipCore(config)
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
  export function getComponent (): TooltipCore { return component }

</script>

<vis-tooltip use:lifecycle={component}></vis-tooltip>

