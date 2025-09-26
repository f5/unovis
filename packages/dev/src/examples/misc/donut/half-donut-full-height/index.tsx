import React, { useEffect, useRef, useState } from 'react'
import { VisSingleContainer, VisDonut, VisDonutRef } from '@unovis/react'
import { DONUT_HALF_ANGLE_RANGES } from '@unovis/ts'
import { DonutSegmentLabelPosition } from '@unovis/ts/components/donut/types'

export const title = 'Half Donut: Full Height'
export const subTitle = 'Testing the resize behavior'
export const component = (): React.ReactNode => {
  const data = [3, 2, 5, 4, 0, 1]
  const ref = useRef<VisDonutRef<number>>(null)
  const [currentAngleRange, setCurrentAngleRange] = useState(DONUT_HALF_ANGLE_RANGES[0])

  useEffect(() => {
    setCurrentAngleRange((prev: [number, number]) => {
      const currentIndex = DONUT_HALF_ANGLE_RANGES.indexOf(prev)
      return DONUT_HALF_ANGLE_RANGES[(currentIndex + 1) % DONUT_HALF_ANGLE_RANGES.length]
    })
  }, [])

  const [showSegmentLabels, setShowSegmentLabels] = useState(true)
  const [segmentLabelPosition, setSegmentLabelPosition] = useState<DonutSegmentLabelPosition>(DonutSegmentLabelPosition.Outside)
  const [segmentLabelOffset, setSegmentLabelOffset] = useState(10)

  const isInside = segmentLabelPosition === DonutSegmentLabelPosition.Inside

  return (
    <>
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
      <VisSingleContainer style={{ height: '100%' }}>
        <VisDonut
          ref={ref}
          value={d => d}
          data={data}
          padAngle={0.02}
          duration={0}
          arcWidth={80}
          angleRange={currentAngleRange}
          centralLabel="Central Label"
          centralSubLabel="Sub-label"
          segmentLabel={d => (d as number).toString()}
          segmentLabelOffset={!isInside ? segmentLabelOffset : undefined}
          showSegmentLabels={showSegmentLabels}
          segmentLabelPosition={segmentLabelPosition}
        />
      </VisSingleContainer>
    </>
  )
}
