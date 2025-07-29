<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Treemap, TreemapConfigInterface, StringAccessor } from '@unovis/ts'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'
  // type defs
  type Datum = $$Generic

  // data and required props
  // eslint-disable-next-line no-undef-init
  export let data: Datum[] = undefined
  export let layers: StringAccessor<Datum>[]

  // config
  let prevConfig: TreemapConfigInterface<Datum>
  let config: TreemapConfigInterface<Datum>
  $: config = { layers, ...$$restProps }

  // component declaration
  let component: Treemap<Datum>
  const lifecycle = getContext<Lifecycle>('component')

  onMount(() => {
    component = new Treemap<Datum>(config)
    return () => component?.destroy()
  })
  $: component?.setData(data)
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Treemap<Datum> { return component }

</script>

<vis-component use:lifecycle={component}/>

