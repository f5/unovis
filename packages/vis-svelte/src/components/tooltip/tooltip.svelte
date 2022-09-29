<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip, TooltipConfigInterface } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'


  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  let component: Tooltip
  const { setTooltip } = getContext('container')

  let setConfig = emptyCallback


  onMount(() => {
    component = new Tooltip(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig

    setTooltip(component)

    return () => { setTooltip(undefined) as void }
  })

  // component accessor
  export function getComponent (): Tooltip { return component }

</script>

<vis-tooltip use:setConfig={config} />

