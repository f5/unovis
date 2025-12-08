import React from 'react'
import { VisSingleContainer, VisTopoJSONMap } from '@unovis/react'
import { TopoJSONMap } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

export const title = 'Map with Labels'
export const subTitle = 'Provided by data'

type AreaDatum = {
  id: string;
  age: number[];
};

export const component = (): React.ReactNode => {
  const data = {
    areas: [
      { id: 'AG', name: 'Antigua and Barbuda' },
      { id: 'AI', name: 'Anguilla' },
      { id: 'AS', name: 'American Samoa' },
      { id: 'AW', name: 'Aruba' },
      { id: 'BB', name: 'Barbados' },
      { id: 'BM', name: 'Bermuda' },
      { id: 'CC', name: 'Cocos Islands' },
      { id: 'CK', name: 'Cook Islands' },
      { id: 'CW', name: 'Curaçao' },
      { id: 'CX', name: 'Christmas Island' },
      { id: 'FM', name: 'Micronesia, Federated States of' },
      { id: 'GD', name: 'Grenada' },
      { id: 'GG', name: 'Guernsey' },
      { id: 'GU', name: 'Guam' },
      { id: 'HM', name: 'Heard Island and McDonald Islands' },
      { id: 'IM', name: 'Isle of Man' },
      { id: 'IO', name: 'British Indian Ocean Territory' },
      { id: 'JE', name: 'Jersey' },
      { id: 'KI', name: 'Kiribati' },
      { id: 'KN', name: 'Saint Kitts and Nevis' },
      { id: 'KY', name: 'Cayman Islands' },
      { id: 'MC', name: 'Monaco' },
      { id: 'MH', name: 'Marshall Islands' },
      { id: 'MO', name: 'Macao' },
      { id: 'MP', name: 'Northern Mariana Islands' },
      { id: 'MS', name: 'Montserrat' },
      { id: 'MT', name: 'Malta' },
      { id: 'MV', name: 'Maldives' },
      { id: 'NF', name: 'Norfolk Island' },
      { id: 'NU', name: 'Niue' },
      { id: 'PM', name: 'Saint Pierre and Miquelon' },
      { id: 'PN', name: 'Pitcairn' },
      { id: 'PW', name: 'Palau' },
      { id: 'SC', name: 'Seychelles' },
      { id: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
      { id: 'SM', name: 'San Marino' },
      { id: 'TC', name: 'Turks and Caicos Islands' },
      { id: 'TO', name: 'Tonga' },
      { id: 'VC', name: 'Saint Vincent and the Grenadines' },
      { id: 'VG', name: 'Virgin Islands, British' },
      { id: 'VI', name: 'Virgin Islands, U.S.' },
      { id: 'WF', name: 'Wallis and Futuna' },
    ],
  }

  return (
    <div>
      <VisSingleContainer data={data} height={'90vh'}>
        <VisTopoJSONMap
          topojson={WorldMapTopoJSON}
          duration={0}
          areaColor='red'
          areaLabel={(d: AreaDatum) => d?.name}
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
