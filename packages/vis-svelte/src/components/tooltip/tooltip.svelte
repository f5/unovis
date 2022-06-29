<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip, TooltipConfigInterface } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'


  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  // component declaration
  const component = new Tooltip(config)
  const { setTooltip } = getContext('container')
  const { setConfig } = getActions.apply(component)


  onMount(() => {
    setTooltip(component)
    return () => setTooltip(undefined) as void
  })

</script>

<vis-tooltip use:setConfig={config} />
