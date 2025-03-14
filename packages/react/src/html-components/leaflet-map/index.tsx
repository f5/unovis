// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { LeafletMap, LeafletMapConfigInterface } from '@unovis/ts'
import { GenericDataRecord } from '@/types/data'

// Utils
import { arePropsEqual } from '@/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisLeafletMapRef<Datum extends GenericDataRecord> = {
  component?: LeafletMap<Datum>;
}

export type VisLeafletMapProps<Datum extends GenericDataRecord> = LeafletMapConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisLeafletMapRef<Datum>>;
  className?: string;
}

export const VisLeafletMapSelectors = LeafletMap.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisLeafletMapFC<Datum extends GenericDataRecord> (props: VisLeafletMapProps<Datum>, fRef: ForwardedRef<VisLeafletMapRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<LeafletMap<Datum>, HTMLDivElement>>(null)
  const componentRef = useRef<LeafletMap<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<LeafletMap<Datum>, HTMLDivElement>)

    const c = new LeafletMap<Datum>(ref.current as VisComponentElement<LeafletMap<Datum>, HTMLDivElement>, props, props.data)
    componentRef.current = c
    element.__component__ = c

    return () => {
      componentRef.current = undefined
      c.destroy()
    }
  }, [])

  // On Props Update
  useEffect(() => {
    const component = componentRef.current
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletMap: (<Datum extends GenericDataRecord>(props: VisLeafletMapProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLeafletMapFC), arePropsEqual)
