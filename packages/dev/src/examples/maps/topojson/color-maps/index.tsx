import React from 'react'
import { VisSingleContainer, VisTopoJSONMap, VisTooltip, VisTopoJSONMapSelectors } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Color Map'
export const subTitle = 'Points with pie chart visualization'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy: number;
  warning: number;
  critical: number;
}

export const data: { points: DataRecord[] } = {
  points: [
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5 },
    { id: 'London', latitude: 51.5074, longitude: -0.1278, healthy: 70, warning: 20, critical: 10 },
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2 },
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10 },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7 },
  ],
}

const colorMap = {
  healthy: { color: '#4CAF50', className: 'healthy' },
  warning: { color: '#FF9800', className: 'warning' },
  critical: { color: '#F44336', className: 'critical' },
}

const tooltipTriggers = {
  [VisTopoJSONMapSelectors.point]: (d: DataRecord) =>
    `<strong>${d.id}</strong><br/>
    Healthy: ${d.healthy}<br/>
    Warning: ${d.warning}<br/>
    Critical: ${d.critical}`,
}

export const component = (): React.ReactNode => {
  return (
    <VisSingleContainer data={data} height={'90vh'}>
      <VisTopoJSONMap<any, DataRecord, any>
        topojson={WorldMapTopoJSON}
        pointRadius={20}
        pointLabel={d => d.id}
        colorMap={colorMap}
      />
      <VisTooltip triggers={tooltipTriggers} />
    </VisSingleContainer>
  )
}
