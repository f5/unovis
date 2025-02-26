import React, { useEffect, useState } from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'MapFitToPoints'
export const subTitle = 'Adjust number of points to change view'

export const component = (): React.ReactNode => {
  const points = [
    { id: 'Qormi', latitude: 35.8985, longitude: 14.4705 },
    { id: 'Syracuse', latitude: 37.0755, longitude: 15.2860 },
    { id: 'Tripoli', latitude: 32.8872, longitude: 13.1913 },
    { id: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { id: 'London', latitude: 51.5074, longitude: -0.1278 },
    { id: 'Reykjavik', latitude: 64.1265, longitude: -21.8174 },
    { id: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { id: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  ]
  const [data, setData] = useState<{ points: typeof points[0][] }>({ points: [] })
  const [numPoints, setNumPoints] = useState(5)
  useEffect(() => {
    setData({ points: points.slice(0, numPoints) })
  }, [numPoints])

  return (
    <div>
      <label>
        <input
          type='range'
          step={1}
          min={2}
          max={points.length}
          value={numPoints}
          onChange={e => setNumPoints(Number(e.target.value))}
        />
        {numPoints}
      </label>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap
          topojson={WorldMapTopoJSON}
          duration={0}
          mapFitToPoints={true}
          zoomExtent={[0.5, 100]}
          pointLabel={d => d.id}
        />
      </VisSingleContainer>
    </div>
  )
}
