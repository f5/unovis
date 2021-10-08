/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Donut, DonutConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisDonutProps<Datum> = DonutConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisDonut<Datum> (props: VisDonutProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Donut<Datum>>>(null)
  const [component] = useState<Donut<Datum>>(new Donut(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Donut<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
VisDonut.selectors = Donut.selectors
