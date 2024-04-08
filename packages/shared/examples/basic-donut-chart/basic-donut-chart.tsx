import React, { useCallback } from 'react'
import { VisSingleContainer, VisDonut, VisBulletLegend } from '@unovis/react'

import { data } from './data'

const legendItems = Object.entries(data).map(([_, data]) => ({
  name: data.key.charAt(0).toUpperCase() + data.key.slice(1),
}))

export default function BasicDonutChart (): JSX.Element {
  return (
    <>
      <h3>Most Common Password Categories</h3>
      <VisBulletLegend items={legendItems}/>
      <VisSingleContainer height={400}>
        <VisDonut
          value={useCallback(d => d.value, [])}
          data={data}
          showEmptySegments={true}
          padAngle={0.01}
          arcWidth={100}
        />
      </VisSingleContainer>
    </>
  )
}
