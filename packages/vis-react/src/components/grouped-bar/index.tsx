// !!! This code was automatically generated. You should not change it !!!
import React, { ForwardedRef, Ref, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { GroupedBar, GroupedBarConfigInterface } from '@unovis/ts'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisGroupedBarRef<Datum> = {
  component: GroupedBar<Datum>;
}

export type VisGroupedBarProps<Datum> = GroupedBarConfigInterface<Datum> & {
  data?: Datum[];
  ref?: Ref<VisGroupedBarRef<Datum>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisGroupedBarFC<Datum> (props: VisGroupedBarProps<Datum>, fRef: ForwardedRef<VisGroupedBarRef<Datum>>): JSX.Element {
  const ref = useRef<VisComponentElement<GroupedBar<Datum>>>(null)
  const [component] = useState<GroupedBar<Datum>>(new GroupedBar(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<GroupedBar<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    if (props.data) component?.setData(props.data)
    component?.setConfig(props)
  })

  useImperativeHandle(fRef, () => ({ component }))
  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisGroupedBar: (<Datum>(props: VisGroupedBarProps<Datum>) => JSX.Element | null) = React.memo(React.forwardRef(VisGroupedBarFC), arePropsEqual)
