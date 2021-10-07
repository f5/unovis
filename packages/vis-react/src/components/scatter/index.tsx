/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
// import { Scatter, ScatterConfigInterface } from '@volterra/vis'
import { Scatter, ScatterConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisScatterProps<Datum> = ScatterConfigInterface<Datum> & { data?: Datum[] }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisScatter<Datum> (props: VisScatterProps<Datum>): JSX.Element {
  const ref = useRef<VisComponentElement<Scatter<Datum>>>(null)
  const [component] = useState<Scatter<Datum>>(new Scatter(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Scatter<Datum>>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setData(props.data ?? [])
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
VisScatter.selectors = Scatter.selectors
