// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { CircularBar } from '@unovis/ts/components/circular-bar'
import { CircularBarConfigInterface } from '@unovis/ts/components/circular-bar/config'

// Utils
import { arePropsEqual } from 'src/utils/react'
import { useContainerRenderOnUpdate } from 'src/utils/container'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisCircularBarRef<Datum> = {
  component?: CircularBar<Datum>;
}

export type VisCircularBarProps<Datum> = CircularBarConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisCircularBarRef<Datum>>;
}

export const VisCircularBarSelectors = CircularBar.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisCircularBarFC<Datum> (props: VisCircularBarProps<Datum>, fRef: ForwardedRef<VisCircularBarRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<CircularBar<Datum>>>(null)
  const componentRef = useRef<CircularBar<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<CircularBar<Datum>>)

    const c = new CircularBar<Datum>(props)
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

  // Ask the container to re-render when this component's config changes (see `useContainerRenderOnUpdate`)
  useContainerRenderOnUpdate()

  useImperativeHandle(fRef, () => ({ get component () { return componentRef.current } }), [])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisCircularBar: (<Datum>(props: VisCircularBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisCircularBarFC), arePropsEqual)
