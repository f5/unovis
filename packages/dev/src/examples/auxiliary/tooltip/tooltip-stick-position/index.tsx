import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { randomNumberGenerator } from '@/utils/data'
import { VisAxis, VisScatter, VisTooltip, VisTooltipProps, VisXYContainer } from '@unovis/react'
import { Position, Scatter } from '@unovis/ts'
import React, { useMemo } from 'react'

export const title = 'Tooltip Sticky Position'
export const subTitle = 'Hoverable Tooltip'

type VisTooltipDurationProps = VisTooltipProps & {
  duration?: number;
};

export const TooltipComponent = (props: VisTooltipDurationProps): React.ReactNode => {
  const data = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    x: i + 10 * randomNumberGenerator(),
    y: randomNumberGenerator() * 10,
    size: 50 * randomNumberGenerator(),
  })), [])

  type XYDataRecord = typeof data[0]
  return (<>
    <VisXYContainer<XYDataRecord> data={data} height={400}>
      <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} size={d => d.size} duration={props.duration}/>
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
        allowHover={true}
        {...props}
      />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  </>
  )
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (<>
    Container: Default, Automatic Placement
    <TooltipComponent duration={props.duration}/>

    Container: Default, Vertical Placement: Center, Horizontal Placement: Right
    <TooltipComponent verticalPlacement={Position.Center} horizontalPlacement={Position.Right} duration={props.duration}/>

    Container: Body, Automatic Placement
    <TooltipComponent container={document.body} duration={props.duration}/>
  </>
  )
}
