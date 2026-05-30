import React, { useState } from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { DonutSegmentLabelPosition } from '@unovis/ts/components/donut/types'

export const title = 'Donut: Full Height'
export const subTitle = 'Testing the resize behavior'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [3, 2, 5, 4, 0, 1]

  const [showSegmentLabels, setShowSegmentLabels] = useState(true)
  const [segmentLabelPosition, setSegmentLabelPosition] = useState<DonutSegmentLabelPosition>(DonutSegmentLabelPosition.Outside)
  const [segmentLabelOffset, setSegmentLabelOffset] = useState(25)
  const isInside = segmentLabelPosition === DonutSegmentLabelPosition.Inside

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={showSegmentLabels}
            onChange={e => setShowSegmentLabels(e.target.checked)}
          />
          Show segment labels
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Position:
          <select
            value={segmentLabelPosition}
            onChange={e => setSegmentLabelPosition(e.target.value as DonutSegmentLabelPosition)}
          >
            <option value={DonutSegmentLabelPosition.Outside}>Outside</option>
            <option value={DonutSegmentLabelPosition.Inside}>Inside</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isInside ? 0.5 : 1 }}>
          Offset:
          <input
            type="range"
            min={10}
            max={50}
            value={segmentLabelOffset}
            onChange={e => setSegmentLabelOffset(Number(e.target.value))}
            disabled={isInside}
          />
          <span>{segmentLabelOffset}</span>
        </label>
      </div>
      <VisSingleContainer style={{ flex: 1 }}>
        <VisDonut
          value={d => d}
          data={data}
          padAngle={0.02}
          duration={props.duration}
          arcWidth={80}
          showSegmentLabels={showSegmentLabels}
          segmentLabelOffset={segmentLabelOffset}
          segmentLabel={d => `${d}`}
          segmentLabelPosition={segmentLabelPosition}
        />
      </VisSingleContainer>
    </div>
  )
}
