import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Clustered Color Map with Shapes'
export const subTitle = 'Points with clustering, color map, and different shapes'

export type DataRecord = {
  id: string;
  latitude: number;
  longitude: number;
  healthy: number;
  warning: number;
  critical: number;
  shape?: string;
  pointColor?: string;
}

// Generate more data points for better clustering demonstration
export const data: { points: DataRecord[] } = {
  points: [
    // New York area cluster
    { id: 'New York', latitude: 40.7128, longitude: -74.0060, healthy: 80, warning: 15, critical: 5, shape: 'circle', pointColor: '#1f77b4' },
    { id: 'Newark', latitude: 40.7357, longitude: -74.1724, healthy: 75, warning: 20, critical: 5, shape: 'circle', pointColor: '#1f77b4' },
    { id: 'Jersey City', latitude: 40.7282, longitude: -74.0776, healthy: 70, warning: 25, critical: 5, shape: 'circle', pointColor: '#1f77b4' },

    // London area cluster
    { id: 'London', latitude: 51.5074, longitude: -0.1278, healthy: 70, warning: 20, critical: 10, shape: 'ring', pointColor: '#ff7f0e' },
    { id: 'Westminster', latitude: 51.3994, longitude: -0.2269, healthy: 65, warning: 25, critical: 10, shape: 'ring', pointColor: '#ff7f0e' },
    { id: 'Camden', latitude: 51.6290, longitude: -0.0255, healthy: 72, warning: 18, critical: 10, shape: 'ring', pointColor: '#ff7f0e' },

    // Tokyo area cluster (spread out for visual distinction)
    { id: 'Tokyo', latitude: 35.6762, longitude: 139.6503, healthy: 90, warning: 8, critical: 2, shape: 'square', pointColor: '#2ca02c' },
    { id: 'Shibuya', latitude: 35.1598, longitude: 140.2006, healthy: 85, warning: 12, critical: 3, shape: 'square', pointColor: '#2ca02c' },
    { id: 'Shinjuku', latitude: 36.1895, longitude: 139.1917, healthy: 88, warning: 10, critical: 2, shape: 'square', pointColor: '#2ca02c' },

    // Sydney area cluster (spread out for visual distinction)
    { id: 'Sydney', latitude: -33.8688, longitude: 151.2093, healthy: 65, warning: 25, critical: 10, shape: 'triangle', pointColor: '#d62728' },
    { id: 'Bondi', latitude: -34.5906, longitude: 151.8767, healthy: 60, warning: 30, critical: 10, shape: 'triangle', pointColor: '#d62728' },

    // Isolated points
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522, healthy: 75, warning: 18, critical: 7, shape: 'circle', pointColor: '#9467bd' },
    { id: 'Berlin', latitude: 52.5200, longitude: 13.4050, healthy: 82, warning: 15, critical: 3, shape: 'square', pointColor: '#8c564b' },
    { id: 'Cairo', latitude: 30.0444, longitude: 31.2357, healthy: 60, warning: 30, critical: 10, shape: 'triangle', pointColor: '#e377c2' },
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
        pointColor={d => d.pointColor}
        pointShape={d => d.shape}
        pointRingWidth={4}
        clustering={true}
        clusteringDistance={40}
        clusterColor={d => d?.clusterPoints?.[0]?.pointColor || '#2196F3'}
        clusterRadius={15}
        clusterExpandOnClick={true}
        zoomExtent={[0.5, 12]}
      />
    </VisSingleContainer>
  )
}
