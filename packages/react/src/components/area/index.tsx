// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Area } from '@unovis/ts/components/area'
import { AreaConfigInterface } from '@unovis/ts/components/area/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAreaRef<Datum> = {
  component?: Area<Datum>;
}

export type VisAreaProps<Datum> = AreaConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisAreaRef<Datum>>;
}

export const VisAreaSelectors = Area.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAreaFC<Datum> (props: VisAreaProps<Datum>, fRef: ForwardedRef<VisAreaRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<Area<Datum>>>(null)
  const componentRef = useRef<Area<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Area<Datum>>)

    const c = new Area<Datum>(props)
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

  // A config change has to drive the render itself: the container re-renders only when its own props
  // change, which doesn't happen when new config reaches this component through React context or a
  // parent's state. See `useContainerRenderOnUpdate` for how updates are detected.
  useContainerRenderOnUpdate()

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisArea: (<Datum>(props: VisAreaProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisAreaFC), arePropsEqual)
