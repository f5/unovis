// eslint-disable-next-line no-use-before-define
import React, { ReactNode, useEffect, useRef, useState, PropsWithChildren } from 'react'
import { SingleContainer, SingleContainerConfigInterface, ComponentCore, Tooltip } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSingleContainerProps<Datum> = SingleContainerConfigInterface<Datum> & {
  data?: Datum;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisSingleContainerFC<Datum> (props: PropsWithChildren<VisSingleContainerProps<Datum>>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<SingleContainer<Datum>>()
  const [data, setData] = useState<Datum | undefined>(undefined)

  const getConfig = (): SingleContainerConfigInterface<Datum> => ({
    ...props,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    component: container.current?.querySelector<VisComponentElement<ComponentCore<Datum>>>('vis-component')?.__component__,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
  })

  // On Mount
  useEffect(() => {
    setData(props.data)
    setChart(
      new SingleContainer<Datum>(container.current as HTMLDivElement, getConfig(), props.data)
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
export const VisSingleContainer: (<Datum>(props: PropsWithChildren<VisSingleContainerProps<Datum>>) => JSX.Element | null) =
  React.memo(VisSingleContainerFC, arePropsEqual)
