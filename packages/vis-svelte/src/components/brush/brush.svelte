<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Brush, BrushConfigInterface, NumericAccessor } from '@unovis/ts'
  import { getContext, onMount } from 'svelte'
  import { emptyCallback, getActions } from '../../utils/actions'

  // type defs
  type Datum = $$Generic

  let config: BrushConfigInterface<Datum>
  $: config = { x, y, ...$$restProps }

  // component declaration
  let component: Brush<Datum>
  const { setComponent, removeComponent } = getContext('container')

  let setConfig = emptyCallback
  let setData = emptyCallback

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let x: NumericAccessor<Datum>
  export let y: NumericAccessor<Datum> | NumericAccessor<Datum>[]

  onMount(() => {
    component = new Brush<Datum>(config)
    const actions = getActions.apply(component)
    setConfig = actions.setConfig
    setData = actions.setData
    setComponent(component)

    return () => { removeComponent(component) as void }
  })

  // component accessor
  export function getComponent (): Brush<Datum> { return component }

</script>

<vis-component use:setData={data} use:setConfig={config} />

