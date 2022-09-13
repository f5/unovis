<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Donut, DonutConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: DonutConfigInterface<Datum>
  $: config = { value, ...$$restProps }

  // component declaration
  const component = new Donut<Datum>(config)
  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)
  // data and required props
  export let data: Datum[]
  export let value: NumericAccessor<Datum>
  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

</script>

<vis-component use:setData={data} use:setConfig={config} />
