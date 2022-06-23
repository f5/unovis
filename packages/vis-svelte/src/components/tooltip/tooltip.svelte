<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Tooltip, TooltipConfigInterface } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'


  // data and required props


  let config: TooltipConfigInterface
  $: config = { ...$$restProps }

  const component = new Tooltip()

  const { setTooltip } = getContext('container')
  const { setConfig } = getActions.apply(component)

  onMount(() => {
    setTooltip(component)

    return () => setTooltip(undefined) as void
  })
</script>

<vis-tooltip use:setConfig={config} />
