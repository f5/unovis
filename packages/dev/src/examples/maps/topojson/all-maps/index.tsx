import React, { useState } from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { TopoJSONMap, MapProjection } from '@unovis/ts'
import { WorldMapTopoJSON, ChinaTopoJSON, FranceTopoJSON, GermanyTopoJSON, IndiaTopoJSON, UKTopoJSON, USATopoJSON } from '@unovis/ts/maps'

export const title = 'Country maps'
export const subTitle = 'Click on country to show its map'

export const component = (): React.ReactNode => {
  const countries = ['CN', 'FR', 'DE', 'IN', 'GB', 'US'].map(id => ({ id }))
  const [selectedCountry, setSelectedCountry] = useState()

  return (
    <div>
      <code>Selected country: <b>{selectedCountry ?? 'none'}</b></code>
      <div style={{ margin: '20px auto', minHeight: '300px', minWidth: '300px' }}>
        {selectedCountry &&
      <VisSingleContainer data={{}}>
        {selectedCountry === 'US' && <VisTopoJSONMap topojson={USATopoJSON} mapFeatureName='states' projection={MapProjection.AlbersUsa()}/>}
        {selectedCountry === 'GB' && <VisTopoJSONMap topojson={UKTopoJSON} mapFeatureName='regions'/>}
        {selectedCountry === 'IN' && <VisTopoJSONMap topojson={IndiaTopoJSON} mapFeatureName='regions'/>}
        {selectedCountry === 'DE' && <VisTopoJSONMap topojson={GermanyTopoJSON} mapFeatureName='regions'/>}
        {selectedCountry === 'FR' && <VisTopoJSONMap topojson={FranceTopoJSON} mapFeatureName='regions'/>}
        {selectedCountry === 'CN' && <VisTopoJSONMap topojson={ChinaTopoJSON} mapFeatureName='provinces'/>}
      </VisSingleContainer>}
      </div>
      <VisSingleContainer data={{ areas: countries }}>
        <VisTopoJSONMap
          topojson={WorldMapTopoJSON}
          duration={0}
          areaColor={a => a.id === selectedCountry ? '#17a2b8' : '#b1d4e0'}
          areaCursor={'pointer'}
          events={{
            [TopoJSONMap.selectors.feature]: {
              click: e => setSelectedCountry(e.data ? e.id : null),
            },
          }}
        />
      </VisSingleContainer>
    </div>
  )
}
