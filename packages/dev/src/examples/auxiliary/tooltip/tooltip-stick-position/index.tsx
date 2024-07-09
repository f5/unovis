import React, { useMemo } from 'react'
import { Position, Scatter } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisScatter, VisTooltip, VisTooltipProps } from '@unovis/react'

export const title = 'Tooltip Sticky Position'
export const subTitle = 'Hoverable Tooltip'

export const TooltipComponent = (props: VisTooltipProps): JSX.Element => {
  const data = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    x: i + 10 * Math.random(),
    y: Math.random() * 10,
    size: 50 * Math.random(),
  })), [])

  type XYDataRecord = typeof data[0]
  return (<>
    <VisXYContainer<XYDataRecord> data={data} height={400}>
      <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} size={d => d.size}/>
      <VisTooltip
        followCursor={false}
        horizontalShift={10}
        verticalShift={10}
        horizontalPlacement={Position.Auto}
        verticalPlacement={Position.Auto}
        triggers={{
          [Scatter.selectors.point]: () => `
              You can hover over this tooltip
          `,
        }}
        {...props}
      />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  </>
  )
}

export const component = (): JSX.Element => {
  return (<>
    Container: Default, Automatic Placement
    <TooltipComponent/>

    Container: Default, Vertical Placement: Center, Horizontal Placement: Right
    <TooltipComponent verticalPlacement={Position.Center} horizontalPlacement={Position.Right}/>

    Container: Body, Automatic Placement
    <TooltipComponent container={document.body}/>
  </>
  )
}
