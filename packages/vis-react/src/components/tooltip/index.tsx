/* eslint-disable notice/notice */
// !!! This code was automatically generated. You should not change it !!!
import React, { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipConfigInterface } from '@volterra/vis'

// Utils
import { arePropsEqual } from 'src/utils/react'

// Types
import { VisComponentElement } from 'src/types/dom'

export type VisTooltipProps = TooltipConfigInterface & { data?: null }

// eslint-disable-next-line @typescript-eslint/naming-convention
function VisTooltipFC (props: VisTooltipProps): JSX.Element {
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

// We export a memoized component to avoid unnecessary re-renders
//  and define its type explicitly to help react-docgen-typescript to extract information about props
export const VisTooltip: ((props: VisTooltipProps) => JSX.Element | null) = React.memo(VisTooltipFC, arePropsEqual)
export const VisTooltipSelectors = Tooltip.selectors
