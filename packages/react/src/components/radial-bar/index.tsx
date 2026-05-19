// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { RadialBar, RadialBarConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisRadialBarRef<Datum> = {
  component?: RadialBar<Datum>;
}

export type VisRadialBarProps<Datum> = RadialBarConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisRadialBarRef<Datum>>;
}

export const VisRadialBarSelectors = RadialBar.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisRadialBarFC<Datum> (props: VisRadialBarProps<Datum>, fRef: ForwardedRef<VisRadialBarRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<RadialBar<Datum>>>(null)
  const componentRef = useRef<RadialBar<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<RadialBar<Datum>>)

    const c = new RadialBar<Datum>(props)
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
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisRadialBar: (<Datum>(props: VisRadialBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisRadialBarFC), arePropsEqual)
