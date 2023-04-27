// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { NestedDonut, NestedDonutConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisNestedDonutRef<Datum> = {
  component?: NestedDonut<Datum>;
}

export type VisNestedDonutProps<Datum> = NestedDonutConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisNestedDonutRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisNestedDonutFC<Datum> (props: VisNestedDonutProps<Datum>, fRef: ForwardedRef<VisNestedDonutRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<NestedDonut<Datum>>>(null)
  const componentRef = useRef<NestedDonut<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<NestedDonut<Datum>>)

    const c = new NestedDonut<Datum>(props)
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

  useImperativeHandle(fRef, () => ({ component: componentRef.current }), [componentRef.current])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisNestedDonut: (<Datum>(props: VisNestedDonutProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisNestedDonutFC), arePropsEqual)
