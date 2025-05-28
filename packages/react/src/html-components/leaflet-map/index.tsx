// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { LeafletMap, LeafletMapConfigInterface, GenericDataRecord } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

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
  const ref = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<LeafletMap<Datum>>()

  // On Mount
  useEffect(() => {
    const c = new LeafletMap<Datum>(ref.current as HTMLDivElement, props, props.data)
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ get component () { return component } }), [])
  return <div className={props.className} ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisLeafletMap: (<Datum extends GenericDataRecord>(props: VisLeafletMapProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLeafletMapFC), arePropsEqual)
