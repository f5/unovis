// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Line, LineConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisLineRef<Datum> = {
  component?: Line<Datum>;
}

export type VisLineProps<Datum> = LineConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisLineRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisLineFC<Datum> (props: VisLineProps<Datum>, fRef: ForwardedRef<VisLineRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<Line<Datum>>>(null)
  const [component, setComponent] = useState<Line<Datum>>()

  // On Mount
  useEffect(() => {
    const element = (ref.current as VisComponentElement<Line<Datum>>)

    const c = new Line<Datum>(props)
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
export const VisLine: (<Datum>(props: VisLineProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisLineFC), arePropsEqual)
