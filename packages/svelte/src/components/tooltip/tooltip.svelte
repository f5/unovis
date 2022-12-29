<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip, TooltipConfigInterface } from '@unovis/ts'
  import { getContext, onDestroy } from 'svelte'

  import type { Lifecycle } from '../../utils/context'
  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: TooltipConfigInterface
  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  const component = new Tooltip(config)
  const lifecycle = getContext<Lifecycle>('container')

  onDestroy(() => component.destroy())
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Tooltip { return component }

</script>

<vis-tooltip use:lifecycle={component}/>

