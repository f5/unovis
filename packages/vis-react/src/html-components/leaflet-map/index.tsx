import React, { useEffect, useRef, useState } from 'react'
import { LeafletMap, LeafletMapConfigInterface } from '@volterra/vis'
import { arePropsEqual } from '../../utils/react'

export type VisLeafletMapProps<Datum> = LeafletMapConfigInterface<Datum> & {
  data?: Datum[];
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisLeafletMapFC<Datum> (props: VisLeafletMapProps<Datum>): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<LeafletMap<Datum>>()

  // On Mount
  useEffect(() => {
    setComponent(
      new LeafletMap(container.current as HTMLDivElement, props, props.data)
    )

    return () => component?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)

    component?.setConfig(props)
  })

  return <div ref={container} className={props.className} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletMap: (<Datum>(props: VisLeafletMapProps<Datum>) => JSX.Element | null) =
  React.memo(VisLeafletMapFC, arePropsEqual)
