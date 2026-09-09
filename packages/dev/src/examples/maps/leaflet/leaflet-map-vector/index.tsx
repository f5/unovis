import React, { useRef, useState } from 'react'
import { VisLeafletMap, VisLeafletMapRef } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Data
import cities from './cities.json'
import { mapKey } from '../constants'

// Style
import s from './style.module.css'

export const title = 'Vector Map'
export const subTitle = 'Vector rendering with MapLibre'


type MapPointDatum = typeof cities[0]
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const mapRef = useRef<VisLeafletMapRef<MapPointDatum> | null>(null)
  const [isMapVisible, setMapVisible] = useState(true)

  const handleClick = (): void => {
    setMapVisible(!isMapVisible)
    if (isMapVisible) mapRef.current?.component?.fitView()
  }

  return (<>
    <button className={s.showHideButton} onClick={handleClick}>{isMapVisible ? 'Hide' : 'Show'} Map</button>
    { isMapVisible ? <VisLeafletMap<MapPointDatum>
      ref={mapRef}
      data={cities}
      pointColor={'#3556FF'}
      pointBottomLabel={d => d.city}
      style={`https://api.maptiler.com/maps/basic-v2-light/style.json?key=${mapKey}`}
      styleDarkTheme={`https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${mapKey}`}
      duration={props.duration}
      flyToDuration={props.duration}
      zoomDuration={props.duration}
      attribution={[
        '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
      ]}
    /> : null }
  </>)
}
