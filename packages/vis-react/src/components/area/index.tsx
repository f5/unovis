// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Area, AreaConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisAreaProps<Datum> = AreaConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisAreaFC<Datum> (props: VisAreaProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Area<Datum>>>(null)
  const [component] = useState<Area<Datum>>(new Area(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Area<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisArea: (<Datum>(props: VisAreaProps<Datum>) => JSX.Element | null) = React.memo(VisAreaFC, arePropsEqual)
