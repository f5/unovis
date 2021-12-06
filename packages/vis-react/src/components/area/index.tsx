/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Area, AreaConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { WithSelectors } from 'src/types/react'
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
const memoizedComponent = React.memo(VisAreaFC, arePropsEqual)
export const VisArea = memoizedComponent as WithSelectors<typeof memoizedComponent, typeof Area.selectors>
VisArea.selectors = Area.selectors
