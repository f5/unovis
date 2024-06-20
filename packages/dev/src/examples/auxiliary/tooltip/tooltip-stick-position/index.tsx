import React from 'react'
import { Position, Scatter } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisScatter, VisTooltip } from '@unovis/react'

import { XYDataRecord } from '@src/utils/data'

export const title = 'Tooltip Sticky Position'
export const subTitle = 'Hoverable Tooltip'

export const component = (): JSX.Element => {
  const data = [
    { x: 0, y: 5 },
    { x: 3, y: 10 },
    { x: 6, y: 0 },
    { x: 9, y: 5 },
  ]

  return (<>
    <VisXYContainer<XYDataRecord> data={data}>
      <VisScatter x={(d: XYDataRecord) => d.x} y={(d: XYDataRecord) => d.y} size={50}/>
      <VisTooltip
        followCursor={false}
        container={document.body}
        horizontalPlacement={Position.Auto}
        verticalPlacement={Position.Auto}
        triggers={{
          [Scatter.selectors.point]: () => `
              You can hover over this tooltip
          `,
        }} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  </>
  )
}
