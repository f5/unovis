// Copyright (c) Volterra, Inc. All rights reserved.
// eslint-disable-next-line no-use-before-define
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { SingleChart, SingleChartConfigInterface, ComponentCore, Tooltip } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisSingleContainerProps<Datum> = SingleChartConfigInterface<Datum> & {
  data?: Datum;
  children?: ReactNode | undefined;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisSingleContainer<Datum> (props: VisSingleContainerProps<Datum>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<SingleChart<Datum>>()

  const getConfig = (): SingleChartConfigInterface<Datum> => ({
    ...props,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    component: container.current?.querySelector<VisComponentElement<ComponentCore<Datum>>>('vis-component')?.__component__,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    tooltip: container.current?.querySelector<VisComponentElement<Tooltip>>('vis-tooltip')?.__component__,
  })

  // On Mount
  useEffect(() => {
    setChart(
      new SingleChart<Datum>(container.current as HTMLDivElement, getConfig(), props.data)
    )

    return () => chart?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    if (props.data) chart?.setData(props.data, preventRender)

    // Update Container and render
    chart?.updateContainer(getConfig())
  })

  return (
    <div ref={container} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {props.children}
    </div>
  )
}
