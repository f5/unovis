<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Annotations } from '@unovis/ts/components/annotations'
  import type { AnnotationsConfigInterface } from '@unovis/ts/components/annotations/config'
  import type { AnnotationItem } from '@unovis/ts/components/annotations/types'
  import { onMount, getContext } from 'svelte'

  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'


  // data and required props
  // eslint-disable-next-line no-undef-init
  export let items: AnnotationItem[] | undefined

  // config
  let prevConfig: AnnotationsConfigInterface
  let config: AnnotationsConfigInterface
  $: config = { items, ...$$restProps }

  // component declaration
  let component: Annotations
  const lifecycle = getContext<Lifecycle>('annotations')

  onMount(() => {
    component = new Annotations(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = config
  }

  // component accessor
  export function getComponent (): Annotations { return component }

</script>

<vis-annotations use:lifecycle={component}/>

