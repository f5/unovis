<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip } from '@unovis/ts/components/tooltip'
  import type { TooltipConfigInterface } from '@unovis/ts/components/tooltip/config'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: TooltipConfigInterface
  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: Tooltip
  const lifecycle = getContext<Lifecycle>('tooltip')

  onMount(() => {
    component = new Tooltip(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Tooltip { return component }

</script>

<vis-tooltip use:lifecycle={component}/>

