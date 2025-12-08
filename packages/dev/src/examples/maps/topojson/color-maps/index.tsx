import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
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
  shape?: string;
}

export const data: { points: DataRecord[] } = {
  points: [
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5, shape: 'circle' },
    { id: 'London', latitude: 51.5074, longitude: -0.1278, healthy: 70, warning: 20, critical: 10, shape: 'ring' },
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2, shape: 'square' },
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10, shape: 'triangle' },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7, shape: 'circle' },
  ],
}

export const component = (): React.ReactNode => {
  const colorMap = {
    healthy: { color: '#4CAF50', className: 'healthy' },
    warning: { color: '#FF9800', className: 'warning' },
    critical: { color: '#F44336', className: 'critical' },
  }

  return (
    <VisSingleContainer data={data} height={'90vh'}>
      <VisTopoJSONMap<any, DataRecord, any>
        topojson={WorldMapTopoJSON}
        pointRadius={10}
        pointLabel={d => d.id}
        pointShape={d => d.shape}
        pointRingWidth={4}
        // colorMap={colorMap}
      />
    </VisSingleContainer>
  )
}
