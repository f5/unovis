import React, { useMemo } from 'react'
import { Scatter } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { randomNumberGenerator } from '@src/utils/data'

export const title = 'Tooltip Show & Hide Delay'
export const subTitle = 'Follow cursor, hoverable'

export const component = (props: ExampleViewerDurationProps): JSX.Element => {
  const data = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    x: i + 10 * randomNumberGenerator(),
    y: randomNumberGenerator() * 10,
    size: 50 * randomNumberGenerator(),
  })), [])

  type XYDataRecord = typeof data[0]
  return (<>
    <VisXYContainer<XYDataRecord> data={data} height={400} duration={props.duration}>
      <VisScatter
        x={(d: XYDataRecord) => d.x}
        y={(d: XYDataRecord) => d.y}
        size={d => d.size}
        duration={props.duration}
      />
      <VisTooltip
        followCursor={true}
        allowHover={true}
        verticalShift={0}
        showDelay={100}
        hideDelay={300}
        triggers={{
          [Scatter.selectors.point]: () => `
              This tooltip follows the cursor,<br/> but you can hover over it
          `,
        }}
      />
    </VisXYContainer>
  </>
  )
}
