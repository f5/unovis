<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Donut, DonutConfigInterface, NumericAccessor } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type Datum = $$Generic

  // data and required props
  export let data: Datum[]
  export let value: NumericAccessor<Datum>

  let config: DonutConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  const component = new Donut<Datum>()

  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setComponent(component)

    return () => removeComponent(component) as void
  })
</script>

<vis-component use:setData={data} use:setConfig={config} />
