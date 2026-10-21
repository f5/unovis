import React, { ForwardedRef, ReactElement, ReactNode, Ref, useImperativeHandle, useEffect, useRef, useState, useContext } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip, TooltipContent, TooltipContentMap, getTooltipContentTargets } from '@unovis/ts/components/tooltip'
import { TooltipConfigInterface } from '@unovis/ts/components/tooltip/config'
import { isEqual } from '@unovis/ts/utils/data'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { VisContainerContext } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipRef = { component?: Tooltip }
export type VisTooltipProps<Datum = any> = Omit<TooltipConfigInterface, 'content'> & {
  content?: TooltipContentMap<(context: TooltipContent<Datum>) => ReactNode>;
  ref?: Ref<VisTooltipRef>;
}

export const VisTooltipSelectors = Tooltip.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTooltipFC<Datum> (props: VisTooltipProps<Datum>, fRef: ForwardedRef<VisTooltipRef>): ReactElement {
  const ref = useRef<VisComponentElement<Tooltip>>(null)
  const componentRef = useRef<Tooltip | undefined>(undefined)
  const prevConfig = useRef<TooltipConfigInterface | undefined>(undefined)
  const [context, setContext] = useState<TooltipContent<Datum> | null>(null)
  const requestRender = useContext(VisContainerContext)?.requestRender
  const { content, ...config } = props
  const renderContent = (value: TooltipContent | null): void => setContext(value as TooltipContent<Datum> | null)

  useEffect(() => {
    const component = new Tooltip(config)
    componentRef.current = component
    if (ref.current) ref.current.__component__ = component
    component.setContentRenderer(renderContent, getTooltipContentTargets(content))
    return () => {
      component.setContentRenderer(undefined)
      componentRef.current = undefined
      component.destroy()
    }
  }, [])

  useEffect(() => {
    const component = componentRef.current
    component?.setContentRenderer(renderContent, getTooltipContentTargets(content))
    if (!isEqual(prevConfig.current, config)) {
      component?.setConfig(config)
      prevConfig.current = config
      requestRender?.()
    }
  })
  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])

  const renderer = context?.trigger !== undefined ? content?.[context.trigger] : undefined
  return <>
    <vis-tooltip ref={ref} />
    {context && renderer && componentRef.current && createPortal(renderer(context), componentRef.current.contentElement)}
  </>
}

export const VisTooltip = React.memo(React.forwardRef(VisTooltipFC), (prev, next) => prev.content === next.content && arePropsEqual(prev, next)) as
  <Datum = any>(props: VisTooltipProps<Datum>) => ReactElement | null
