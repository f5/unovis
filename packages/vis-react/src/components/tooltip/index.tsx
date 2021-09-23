/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import { useEffect, useRef, useState } from 'react'
// import { Tooltip, TooltipConfigInterface } from '@volterra/vis'
import { Tooltip, TooltipConfigInterface } from '@volterra/vis'

export type VisTooltipProps = TooltipConfigInterface & { data?: null }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTooltip (props: VisTooltipProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  type RefType = HTMLDivElement & { __component__: Tooltip }
  const ref = useRef<RefType>(null)
  const [component] = useState<Tooltip>(new Tooltip(props))

  // On Mount
  useEffect(() => {
    (ref.current as RefType).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setConfig(props)
  })

  return <vis-component ref={ref} />
}
