import React from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'

import { ChoroplethData, countries, usersDomain, formatUsers } from './data'
import { BLUES } from './constants'

// Nivo's choropleth draws the countries only: points and links between them would need custom code
export default function NivoChoroplethMap ({ data, isDark }: { data: ChoroplethData; isDark: boolean }): JSX.Element {
  return (
    <ResponsiveChoropleth
      features={countries}
      data={data.areas.map(a => ({ id: a.id, value: a.users }))}
      domain={usersDomain}
      colors={BLUES}
      label="properties.name"
      valueFormat={formatUsers}
      // The projection, Mercator by default, doesn't fit the container on its own
      projectionScale={85}
      projectionTranslation={[0.5, 0.65]}
      legends={[{ anchor: 'bottom-left', direction: 'column', translateX: 10, translateY: -10, itemWidth: 110, itemHeight: 16, symbolSize: 12, itemTextColor: isDark ? '#ccc' : '#444' }]}
      theme={{ tooltip: { container: { background: isDark ? '#222' : '#fff', color: isDark ? '#ccc' : '#333' } } }}
    />
  )
}
