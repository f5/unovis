// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Axis, AxisConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAxisRef<Datum> = {
  component?: Axis<Datum>;
}

export type VisAxisProps<Datum> = AxisConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisAxisRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAxisFC<Datum> (props: VisAxisProps<Datum>, fRef: ForwardedRef<VisAxisRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Axis<Datum>>>(null)
  const [component, setComponent] = useState<Axis<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Axis<Datum>>)

    const c = new Axis<Datum>(props)
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
  return <vis-axis ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisAxis: (<Datum>(props: VisAxisProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisAxisFC), arePropsEqual)
