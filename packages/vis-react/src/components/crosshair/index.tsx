// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Crosshair, CrosshairConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisCrosshairProps<Datum> = CrosshairConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisCrosshairFC<Datum> (props: VisCrosshairProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Crosshair<Datum>>>(null)
  const [component] = useState<Crosshair<Datum>>(new Crosshair(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Crosshair<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-crosshair ref={ref} />
}

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisCrosshair: (<Datum>(props: VisCrosshairProps<Datum>) => JSX.Element | null) = React.memo(VisCrosshairFC, arePropsEqual)
