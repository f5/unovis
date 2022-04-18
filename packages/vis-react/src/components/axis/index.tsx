// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Axis, AxisConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAxisProps<Datum> = AxisConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAxisFC<Datum> (props: VisAxisProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Axis<Datum>>>(null)
  const [component] = useState<Axis<Datum>>(new Axis(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Axis<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-axis ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisAxis: (<Datum>(props: VisAxisProps<Datum>) => JSX.Element | null) = React.memo(VisAxisFC, arePropsEqual)
