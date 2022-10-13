<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip, TooltipConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { arePropsEqual } from '../../utils/props'


  // config
  let prevConfig: TooltipConfigInterface
  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: Tooltip
  const { setTooltip } = getContext('container')

  onMount(() => {
    component = new Tooltip(config)
    setTooltip(component)
    return () => { setTooltip(undefined) as void }
  })

  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Tooltip { return component }

</script>

<vis-tooltip/>

