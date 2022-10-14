// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
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

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisGroupedBarFC<Datum> (props: VisGroupedBarProps<Datum>, fRef: ForwardedRef<VisGroupedBarRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<GroupedBar<Datum>>>(null)
  const [component, setComponent] = useState<GroupedBar<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<GroupedBar<Datum>>)

    // React 18 in Strict Mode renders components twice. At the same time, a Container that contains this component
    // (e.g. XYContainer) will be updated only after the first render. So we need to make sure that the component will
    // be initialized only once and won't get destroyed after the first render
    const hasAlreadyBeenInitialized = element.__component__
    const c = element.__component__ || new GroupedBar<Datum>(props)
    setComponent(c)
    element.__component__ = c

    return () => hasAlreadyBeenInitialized && c.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }), [component])
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisGroupedBar: (<Datum>(props: VisGroupedBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisGroupedBarFC), arePropsEqual)
