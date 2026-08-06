<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Brush } from '@unovis/ts/components/brush'
  import type { BrushConfigInterface } from '@unovis/ts/components/brush/config'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined

  // config
  let prevConfig: BrushConfigInterface<Datum>
  let config: BrushConfigInterface<Datum>
  $: config = { ...$$restProps }

  // component declaration
  let component: Brush<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Brush<Datum>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Brush<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

