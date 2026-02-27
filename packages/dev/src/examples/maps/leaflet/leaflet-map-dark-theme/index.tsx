import React from 'react'
import { VisLeafletMap } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Data
import cities from '../leaflet-map-vector/cities.json'

import s from './style.module.css'

export const title = 'Dark Theme'
export const subTitle = 'Map style switching with dark theme support'

type MapPointDatum = (typeof cities)[0]

export const component = (
  props: ExampleViewerDurationProps
): React.ReactNode => {
  const mapKey = 'LNln6dGJDxyBa7F3c7Gd'

  return (
    <div>
      <button className={s.toggleButton} onClick={() => document.documentElement.classList.toggle('dark-theme')}>
        Toggle documentElement
      </button>
      <VisLeafletMap<MapPointDatum>
        data={cities}
        pointLatitude={(d: MapPointDatum) => d.latitude}
        pointLongitude={(d: MapPointDatum) => d.longitude}
        pointColor='#3556FF'
        pointBottomLabel={(d: MapPointDatum) => d.city}
        duration={props.duration}
        flyToDuration={props.duration}
        zoomDuration={props.duration}
        style={`https://api.maptiler.com/maps/basic-v2-light/style.json?key=${mapKey}`}
        styleDarkTheme={`https://api.maptiler.com/maps/basic-v2-dark/style.json?key=${mapKey}`}
      />
    </div>
  )
}
