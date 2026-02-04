import React, { useMemo } from 'react'
import { Scatter } from '@unovis/ts'
import { VisXYContainer, VisAxis, VisScatter, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { randomNumberGenerator } from '@/utils/data'

export const title = 'Tooltip: Empty Content'
export const subTitle = 'Testing empty tooltip behavior'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    x: i + 10 * randomNumberGenerator(),
    y: randomNumberGenerator() * 10,
    size: 50 * randomNumberGenerator(),
    category: i % 4, // Now using 4 categories
  })), [])

  type XYDataRecord = typeof data[0]

  return (
    <div>
      <p>This example tests tooltip behavior with different empty content scenarios:</p>
      <ul>
        <li>Points in category 0 (red): Show normal tooltip with data</li>
        <li>Points in category 1 (blue): Return empty string - show empty tooltip</li>
        <li>Points in category 2 (green): Return null - should not show tooltip</li>
        <li>Points in category 3 (orange): Return undefined - show empty tooltip</li>
      </ul>

      <VisXYContainer<XYDataRecord> data={data} height={400}>
        <VisScatter
          x={(d: XYDataRecord) => d.x}
          y={(d: XYDataRecord) => d.y}
          size={d => d.size}
          color={d => {
            switch (d.category) {
              case 0: return '#e74c3c' // Red
              case 1: return '#3498db' // Blue
              case 2: return '#2ecc71' // Green
              case 3: return '#f39c12' // Orange
              default: return '#95a5a6' // Gray fallback
            }
          }}

          attributes={{
            [Scatter.selectors.point]: {
              visScatterPointE2eTestId: (d: XYDataRecord) => `scatter-point-category-${d.category}`,
            },
          }}
          duration={props.duration}
        />
        <VisTooltip
          attributes={{
            visTooltipE2eTestId: 'scatter-tooltip',
          }}
          triggers={{
            [Scatter.selectors.point]: (d: XYDataRecord) => {
              switch (d.category) {
                case 0:
                  return `Normal tooltip: x=${d.x.toFixed(2)}, y=${d.y.toFixed(2)}, category=${d.category}`
                case 1:
                  return ''
                case 2:
                  return null
                case 3:
                  return undefined
                default:
                  return 'Default tooltip'
              }
            },
          }}
        />
        <VisAxis type='x' />
        <VisAxis type='y' />
      </VisXYContainer>
    </div>
  )
}
