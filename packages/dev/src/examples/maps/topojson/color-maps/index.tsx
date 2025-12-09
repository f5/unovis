import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Clustered Color Map'
export const subTitle = 'Points with clustering and pie chart visualization'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy: number;
  warning: number;
  critical: number;
  shape?: string;
}

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[] } = {
  points: [
    // New York area cluster
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5, shape: 'circle' },
    { id: 'Newark', latitude: 40.7357, longitude: -74.1724, healthy: 75, warning: 20, critical: 5, shape: 'circle' },
    { id: 'Jersey City', latitude: 40.7282, longitude: -74.0776, healthy: 70, warning: 25, critical: 5, shape: 'circle' },

    // London area cluster
    { id: 'London', latitude: 51.5074, longitude: -0.1278, healthy: 70, warning: 20, critical: 10, shape: 'ring' },
    { id: 'Westminster', latitude: 51.4994, longitude: -0.1269, healthy: 65, warning: 25, critical: 10, shape: 'ring' },
    { id: 'Camden', latitude: 51.5290, longitude: -0.1255, healthy: 72, warning: 18, critical: 10, shape: 'ring' },

    // Tokyo area cluster
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2, shape: 'square' },
    { id: 'Shibuya', latitude: 35.6598, longitude: 139.7006, healthy: 85, warning: 12, critical: 3, shape: 'square' },
    { id: 'Shinjuku', latitude: 35.6895, longitude: 139.6917, healthy: 88, warning: 10, critical: 2, shape: 'square' },

    // Sydney area cluster
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10, shape: 'triangle' },
    { id: 'Bondi', latitude: -33.8906, longitude: 151.2767, healthy: 60, warning: 30, critical: 10, shape: 'triangle' },

    // Isolated points
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7, shape: 'circle' },
    { id: 'Berlin', latitude: 52.5200, longitude: 13.4050, healthy: 82, warning: 15, critical: 3, shape: 'circle' },
    { id: 'Cairo', latitude: 30.0444, longitude: 31.2357, healthy: 60, warning: 30, critical: 10, shape: 'triangle' },
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
        pointRadius={15}
        pointLabel={d => d.id}
        pointShape={d => d.shape}
        pointRingWidth={4}
        clustering={true}
        clusteringDistance={100}
        clusterColor={() => '#2196F3'}
        clusterRadius={20}
        clusterRingWidth={3}
        clusterExpandOnClick={true}
        // colorMap={colorMap}
      />
    </VisSingleContainer>
  )
}
