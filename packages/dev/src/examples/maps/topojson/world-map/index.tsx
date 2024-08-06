import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { TopoJSONMap } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'World Map'
export const subTitle = 'Default WorldMapTopoJSON'

export const component = (): JSX.Element => {
  const data = {
    areas: [
      'AW', 'AI', 'AS', 'AG', 'BM', 'BB', 'CK', 'CW', 'KY', 'FM', 'GG', 'GD', 'GU', 'HM', 'IM',
      'CC', 'CX', 'IO', 'JE', 'KI', 'KN', 'MO', 'MC', 'MV', 'MH', 'MT', 'MP', 'MS', 'NF', 'NU',
      'PN', 'PW', 'SH', 'SM', 'PM', 'SC', 'TC', 'TO', 'VC', 'VG', 'VI', 'WF',
    ].map(c => ({ id: c })),
  }

  return (
    <div>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap
          topojson={WorldMapTopoJSON}
          duration={0}
          areaColor='red'
          zoomExtent={[0.5, 100]}
          events={{
            [TopoJSONMap.selectors.feature]: {
              // click: c => console.log(c),
            },
          }}
        />
      </VisSingleContainer>
    </div>
  )
}
