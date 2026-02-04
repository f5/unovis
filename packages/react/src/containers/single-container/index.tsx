// eslint-disable-next-line no-use-before-define
// Types
import { VisComponentElement } from '@/types/dom'
// Utils
import { arePropsEqual } from '@/utils/react'
import { Annotations, ComponentCore, SingleContainer, SingleContainerConfigInterface, Tooltip } from '@unovis/ts'
import React, { PropsWithChildren, useEffect, useRef } from 'react'


export type VisSingleContainerProps<Data> = SingleContainerConfigInterface<Data> & {
  data?: Data;
  className?: string;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisSingleContainerFC<Data> (props: PropsWithChildren<VisSingleContainerProps<Data>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const prevPropsRef = useRef<PropsWithChildren<VisSingleContainerProps<Data>>>({})
  const chartRef = useRef<SingleContainer<Data> | undefined>(undefined)
  const dataRef = useRef<Data | undefined>(undefined)
  const animationFrameRef = useRef<number | null>(null)

  const getConfig = (): SingleContainerConfigInterface<Data> => ({
    ...props,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    component: container.current?.querySelector<VisComponentElement<ComponentCore<Data>>>('vis-component')?.__component__,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
    annotations: container.current?.querySelector<VisComponentElement<Annotations>>('vis-annotations')?.__component__,
  })

  // On Mount
  useEffect(() => {
    const c = new SingleContainer<Data>(container.current as HTMLDivElement, getConfig(), props.data)
    chartRef.current = c
    prevPropsRef.current = props
    dataRef.current = props.data

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
        prevPropsRef.current = {}
      }
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    if (props.data && (props.data !== dataRef.current)) {
      chartRef.current?.setData(props.data, preventRender)
      dataRef.current = props.data
    }

    // Update and render
    // ! Experimental: we use `requestAnimationFrame` to make the wrapper compatible with React 18 Strict Mode.
    // React 18 in Strict Mode renders components twice. At the same time, this container will get updated only after
    // the first render of its children (VisSankey, VisGraph, ...) meaning that their wrong instances (the ones
    // that will be destroyed soon) are stored in the `__component__` property of their elements at that moment.
    // So we delay the container update with `requestAnimationFrame` to wait till the new instances of children
    // components are available at `__component__`.
    if (!arePropsEqual(prevPropsRef.current, props)) { // Checking whether the props have changed do avoid multiple renders
      prevPropsRef.current = props
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = requestAnimationFrame(() => {
        chartRef.current?.updateContainer(getConfig())
      })
    }
  })

  return (
    <div ref={container} className={props.className} style={props.style}>
      {props.children}
    </div>
  )
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisSingleContainer: (<Data>(props: PropsWithChildren<VisSingleContainerProps<Data>>) => JSX.Element | null) =
  React.memo(VisSingleContainerFC, arePropsEqual)
