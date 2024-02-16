// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Brush, BrushConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisBrushRef<Datum> = {
  component?: Brush<Datum>;
}

export type VisBrushProps<Datum> = BrushConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisBrushRef<Datum>>;
}

export const VisBrushSelectors = Brush.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisBrushFC<Datum> (props: VisBrushProps<Datum>, fRef: ForwardedRef<VisBrushRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Brush<Datum>>>(null)
  const componentRef = useRef<Brush<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Brush<Datum>>)

    const c = new Brush<Datum>(props)
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
export const VisBrush: (<Datum>(props: VisBrushProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisBrushFC), arePropsEqual)
