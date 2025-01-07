import React, { useEffect, useState } from 'react'
import { VisSingleContainer, VisDonut } from '@unovis/react'
import { DONUT_HALF_ANGLE_RANGES } from '@unovis/ts'

export const title = 'Half Donut: Full Height'
export const subTitle = 'Testing the resize behavior'
export const component = (): JSX.Element => {
  const data = [3, 2, 5, 4, 0, 1]

  const [currentAngleRange, setCurrentAngleRange] = useState(DONUT_HALF_ANGLE_RANGES[0])

  // Cycle through the half-donut angle ranges for testing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAngleRange((prev: [number, number]) => {
        const currentIndex = DONUT_HALF_ANGLE_RANGES.indexOf(prev)
        return DONUT_HALF_ANGLE_RANGES[(currentIndex + 1) % DONUT_HALF_ANGLE_RANGES.length]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <VisSingleContainer style={{ height: '100%' }} >
      <VisDonut
        value={d => d}
        data={data}
        padAngle={0.02}
        duration={0}
        arcWidth={80}
        angleRange={currentAngleRange}
        centralLabel="Central Label"
        centralSubLabel="Sub-label"
      />
    </VisSingleContainer>
  )
}
