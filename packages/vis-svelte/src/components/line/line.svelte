<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Line, LineConfigInterface, NumericAccessor } from '@volterra/vis'
  import { getContext, onMount } from 'svelte'
  import { getActions } from '../../utils/actions'

  type Datum = $$Generic

  // data and required props
  export let data: Datum[]
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  let config: LineConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  const component = new Line<Datum>()

  const { setComponent, removeComponent } = getContext('container')
  const { setConfig, setData } = getActions.apply(component)

  onMount(() => {
    setComponent(component)

    return () => removeComponent(component) as void
  })
</script>

<vis-component use:setData={data} use:setConfig={config} />
