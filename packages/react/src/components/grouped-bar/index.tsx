// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, ReactElement, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { GroupedBar, GroupedBarConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisGroupedBarRef<Datum> = {
  component?: GroupedBar<Datum>;
}

export type VisGroupedBarProps<Datum> = GroupedBarConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisGroupedBarRef<Datum>>;
}

export const VisGroupedBarSelectors = GroupedBar.selectors

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisGroupedBarFC<Datum> (props: VisGroupedBarProps<Datum>, fRef: ForwardedRef<VisGroupedBarRef<Datum>>): ReactElement {
  const ref = useRef<VisComponentElement<GroupedBar<Datum>>>(null)
  const componentRef = useRef<GroupedBar<Datum> | undefined>(undefined)

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<GroupedBar<Datum>>)

    const c = new GroupedBar<Datum>(props)
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
export const VisGroupedBar: (<Datum>(props: VisGroupedBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisGroupedBarFC), arePropsEqual)
