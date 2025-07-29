// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Treemap, TreemapConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTreemapRef<Datum> = {
  component?: Treemap<Datum>;
}

export type VisTreemapProps<Datum> = TreemapConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisTreemapRef<Datum>>;
}

export const VisTreemapSelectors = Treemap.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTreemapFC<Datum> (props: VisTreemapProps<Datum>, fRef: ForwardedRef<VisTreemapRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Treemap<Datum>>>(null)
  const componentRef = useRef<Treemap<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Treemap<Datum>>)

    const c = new Treemap<Datum>(props)
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
export const VisTreemap: (<Datum>(props: VisTreemapProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisTreemapFC), arePropsEqual)
