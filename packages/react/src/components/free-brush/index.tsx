// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { FreeBrush, FreeBrushConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisFreeBrushRef<Datum> = {
  component?: FreeBrush<Datum>;
}

export type VisFreeBrushProps<Datum> = FreeBrushConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisFreeBrushRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisFreeBrushFC<Datum> (props: VisFreeBrushProps<Datum>, fRef: ForwardedRef<VisFreeBrushRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<FreeBrush<Datum>>>(null)
  const [component, setComponent] = useState<FreeBrush<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<FreeBrush<Datum>>)

    const c = new FreeBrush<Datum>(props)
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
export const VisFreeBrush: (<Datum>(props: VisFreeBrushProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisFreeBrushFC), arePropsEqual)
