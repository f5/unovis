// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { StackedBar, StackedBarConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisStackedBarRef<Datum> = {
  component?: StackedBar<Datum>;
}

export type VisStackedBarProps<Datum> = StackedBarConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisStackedBarRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisStackedBarFC<Datum> (props: VisStackedBarProps<Datum>, fRef: ForwardedRef<VisStackedBarRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<StackedBar<Datum>>>(null)
  const [component, setComponent] = useState<StackedBar<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<StackedBar<Datum>>)

    const c = new StackedBar<Datum>(props)
    setComponent(c)
    element.__component__ = c

    return () => c.destroy()
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
export const VisStackedBar: (<Datum>(props: VisStackedBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisStackedBarFC), arePropsEqual)
