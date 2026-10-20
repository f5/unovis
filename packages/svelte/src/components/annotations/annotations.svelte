<script lang="ts">
  // !!! This code was automatically generated. You should not change it !!!
  import { Annotations as AnnotationsCore } from '@unovis/ts/components/annotations'
  import type { AnnotationsConfigInterface } from '@unovis/ts/components/annotations/config'
  import type { AnnotationItem } from '@unovis/ts/components/annotations/types'
  import { cloneDeep } from '@unovis/ts/utils/data'
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
  let component: AnnotationsCore
  const lifecycle = getContext<Lifecycle>('annotations')
  // Notifies the container that this component's data or config has changed, so it can re-render
  const dirty = getContext<(() => void) | undefined>('dirty')

  onMount(() => {
    component = new AnnotationsCore(config)
    return () => component?.destroy()
  })
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  // component accessor
  export function getComponent (): AnnotationsCore { return component }

</script>

<vis-annotations use:lifecycle={component}></vis-annotations>

