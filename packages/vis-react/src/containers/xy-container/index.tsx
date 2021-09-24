// Copyright (c) Volterra, Inc. All rights reserved.
import { useEffect, useRef, useState } from 'react'
import { XYContainer, XYContainerConfigInterface, XYComponentCore } from '@volterra/vis'

export type VisXYContainerProps<Datum> = XYContainerConfigInterface<Datum> & {
  data: Datum[];
  children?: JSX.Element[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisXYContainer<Datum> (props: VisXYContainerProps<Datum>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<XYContainer<Datum>>()

  const getConfig = (): XYContainerConfigInterface<Datum> => ({
    ...props,
    components: Array.from(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      container.current?.querySelectorAll<HTMLElement & {__component__: XYComponentCore<Datum>}>('vis-component') ?? []
    ).map(c => c.__component__),
  })

  // On Mount
  useEffect(() => {
    setChart(
      new XYContainer<Datum>(container.current as HTMLDivElement, getConfig(), props.data ?? [])
    )

    return () => chart?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    const preventRender = true

    // Set new Data without re-render
    chart?.setData(props.data ?? [], preventRender)

    // Update Container and render
    chart?.updateContainer(getConfig())
  })

  return (
    <div ref={container} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {props.children}
    </div>
  )
}
