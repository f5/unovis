<script lang="ts">
  import { Tooltip, getTooltipContentTargets } from '@unovis/ts/components/tooltip'
  import type { TooltipContent, TooltipContentMap } from '@unovis/ts/components/tooltip'
  import type { TooltipConfigInterface } from '@unovis/ts/components/tooltip/config'
  import { cloneDeep, isFunction } from '@unovis/ts/utils/data'
  import { onMount, getContext } from 'svelte'
  import type { ComponentType } from 'svelte'
  import type { Lifecycle } from '../../types/context'
  import { arePropsEqual } from '../../utils/props'

  type NativeContent = ComponentType | { component: ComponentType; props?: Record<string, any> }
  type $$Props = Omit<TooltipConfigInterface, 'content'> & { content?: TooltipContentMap<NativeContent> }
  export let content: $$Props['content'] = undefined

  let prevConfig: TooltipConfigInterface
  let config: TooltipConfigInterface
  $: config = { ...$$restProps }
  let component: Tooltip
  let context: TooltipContent<any> | null = null
  $: entry = context?.trigger !== undefined ? content?.[context.trigger] : undefined
  $: nativeContent = isFunction(entry) ? { component: entry } : entry
  const lifecycle = getContext<Lifecycle>('tooltip')
  const dirty = getContext<(() => void) | undefined>('dirty')

  function renderContent (value: TooltipContent | null): void {
    context = value as TooltipContent<any> | null
  }

  function mountContent (node: HTMLElement): { destroy: () => void } {
    component.contentElement.appendChild(node)
    return { destroy: () => node.remove() }
  }

  onMount(() => {
    component = new Tooltip(config)
    component.setContentRenderer(renderContent, getTooltipContentTargets(content))
    return () => {
      component.setContentRenderer(undefined)
      component.destroy()
    }
  })

  $: component?.setContentRenderer(renderContent, getTooltipContentTargets(content))
  $: if (!arePropsEqual(prevConfig, config)) {
    component?.setConfig(config)
    prevConfig = cloneDeep(config)
    // Refresh the container action when configuration changes
    component = component
    dirty?.()
  }

  export function getComponent (): Tooltip { return component }
</script>

<vis-tooltip use:lifecycle={component}></vis-tooltip>
{#if component && context && nativeContent}
  <div use:mountContent>
    <svelte:component this={nativeContent.component} {...nativeContent.props} {...context} />
  </div>
{/if}
