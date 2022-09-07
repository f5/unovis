import React, { ForwardedRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { LeafletMap, LeafletMapConfigInterface } from '@unovis/ts'
import { arePropsEqual } from '../../utils/react'

export type VisLeafletMapProps<Datum> = LeafletMapConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisLeafletMapRef<Datum>>;
  className?: string;
}

export type VisLeafletMapRef<Datum> = {
  component: LeafletMap<Datum> | undefined;
}

export function VisLeafletMapFC<Datum> (props: VisLeafletMapProps<Datum>, ref: ForwardedRef<VisLeafletMapRef<Datum>>): JSX.Element {
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

  useImperativeHandle(ref, () => ({ component }))
  return <div ref={container} className={props.className} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletMap: (<Datum>(props: VisLeafletMapProps<Datum>) => JSX.Element | null) =
  React.memo(React.forwardRef(VisLeafletMapFC), arePropsEqual)
