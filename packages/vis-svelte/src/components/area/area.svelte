<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Area, AreaConfigInterface, NumericAccessor } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: AreaConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  const component = new Area<Datum>(config)
  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  onMount(() => {
    setComponent(component)
    return () => removeComponent(component) as void
  })

</script>

<vis-component use:setData={data} use:setConfig={config} />
