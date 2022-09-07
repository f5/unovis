// eslint-disable-next-line no-use-before-define
import React, { ReactNode, useEffect, useRef, useState, PropsWithChildren } from 'react'
import { SingleContainer, SingleContainerConfigInterface, ComponentCore, Tooltip } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSingleContainerProps<Data> = SingleContainerConfigInterface<Data> & {
  data?: Data;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisSingleContainerFC<Data> (props: PropsWithChildren<VisSingleContainerProps<Data>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<SingleContainer<Data>>()
  const [data, setData] = useState<Data | undefined>(undefined)

  const getConfig = (): SingleContainerConfigInterface<Data> => ({
    ...props,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    component: container.current?.querySelector<VisComponentElement<ComponentCore<Data>>>('vis-component')?.__component__,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
  })

  // On Mount
  useEffect(() => {
    setData(props.data)
    setChart(
      new SingleContainer<Data>(container.current as HTMLDivElement, getConfig(), props.data)
    )
    return () => chart?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    if (props.data && (props.data !== data)) {
      chart?.setData(props.data, preventRender)
      setData(props.data)
    }

    // Update Container and render
    chart?.updateContainer(getConfig())
  })

  return (
    <div ref={container} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {props.children}
    </div>
  )
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisSingleContainer: (<Data>(props: PropsWithChildren<VisSingleContainerProps<Data>>) => JSX.Element | null) =
  React.memo(VisSingleContainerFC, arePropsEqual)
