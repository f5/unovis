/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipConfigInterface } from '@volterra/vis'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipProps = TooltipConfigInterface & { data?: null }

// eslint-disable-next-line @typescript-eslint/naming-convention
export function VisTooltip (props: VisTooltipProps): JSX.Element {
  const ref = useRef<VisComponentElement<Tooltip>>(null)
  const [component] = useState<Tooltip>(new Tooltip(props))

  // On Mount
  useEffect(() => {
    (ref.current as VisComponentElement<Tooltip>).__component__ = component
  }, [])

  // On Props Update
  useEffect(() => {
    component?.setConfig(props)
  })

  return <vis-tooltip ref={ref} />
}
VisTooltip.selectors = Tooltip.selectors
