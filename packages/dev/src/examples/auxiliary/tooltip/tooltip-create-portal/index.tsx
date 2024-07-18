import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Position, Scatter, Tooltip } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisScatter, VisTooltip } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'
import { createPortal } from 'react-dom'

export const title = 'Tooltip Rendered in Portal'
export const subTitle = 'Dynamic content in tooltip'

export const TooltipComponent = (props: { x: number; y: number }): JSX.Element => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [props.x, props.y])

  if (loading) {
    return <div>Loading...</div>
  }

  return <div>
    <div>X: {props.x}</div>
    <div>Y: {props.y}</div>
  </div>
}

export const component = (): JSX.Element => {
  const [tooltipClassName, setTooltipClassName] = useState<string>('unovis-custom-tooltip')
  const [hoveredDatum, setHoveredDatum] = React.useState<XYDataRecord | null>(null)
  const data: XYDataRecord[] = useMemo(() => [
    { x: 1, y: 3 },
    { x: 3, y: 8 },
    { x: 4, y: 9 },
    { x: 9, y: 5 },
  ], [])

  // Test dynamic changing of the tooltip class name
  useEffect(() => {
    setTimeout(() => {
      setTooltipClassName('unovis-custom-tooltip-2')
    }, 1000)
  }, [])

  const tooltipContainerNode = document.querySelector(`.${tooltipClassName}`)
  return (<>
    <VisXYContainer<XYDataRecord> data={data}>
      <VisScatter
        x={useCallback((d: XYDataRecord) => d.x, [])}
        y={useCallback((d: XYDataRecord) => d.y, [])}
        size={40}
        color={'#5d30c9'}
      />
      <VisTooltip
        className={tooltipClassName}
        followCursor={false}
        container={document.body}
        horizontalPlacement={Position.Auto}
        verticalPlacement={Position.Auto}
        triggers={useMemo(() => ({
          [Scatter.selectors.point]: (d: XYDataRecord) => {
            setHoveredDatum(d)
          },
        }), [])} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
    {tooltipContainerNode && hoveredDatum && createPortal(
      <TooltipComponent
        x={hoveredDatum.x}
        y={hoveredDatum.y as number}
      />, tooltipContainerNode)}
  </>
  )
}
