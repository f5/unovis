// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Scatter, ScatterConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisScatterRef<Datum> = {
  component?: Scatter<Datum>;
}

export type VisScatterProps<Datum> = ScatterConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisScatterRef<Datum>>;
}

export const VisScatterSelectors = Scatter.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisScatterFC<Datum> (props: VisScatterProps<Datum>, fRef: ForwardedRef<VisScatterRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Scatter<Datum>>>(null)
  const componentRef = useRef<Scatter<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Scatter<Datum>>)

    const c = new Scatter<Datum>(props)
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
export const VisScatter: (<Datum>(props: VisScatterProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisScatterFC), arePropsEqual)
