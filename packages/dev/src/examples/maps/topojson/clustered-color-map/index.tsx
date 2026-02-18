import React, { useRef, useEffect, useState } from 'react'
import { VisSingleContainer, VisTopoJSONMap, VisTopoJSONMapRef } from '@unovis/react'
import { WorldMapTopoJSON } from '@unovis/ts/maps'
import './style.module.css'

export const title = 'Clustered Color Map'
export const subTitle = 'Points with clustering and pie chart visualization'

// Minimal area datum type for areaLabel accessor
type AreaDatum = {
  id?: string;
  name?: string;
}

export type DataRecord = {
  name: string;
  longitude: number;
  latitude: number;
  normal: number | null | undefined;
  blocked: number | null | undefined;
  description?: string | null;
}

export const data: { points: DataRecord[]; areas?: AreaDatum[] } = {
  points: [
    { latitude: 52.35598, longitude: 4.95035, name: 'ams9', normal: 948, blocked: 4, description: 'Active server' },
    { latitude: 35.66822, longitude: 139.67082, name: 'ap-1', normal: 105, blocked: 0 },
    { latitude: 33.64989, longitude: 121.12389, name: 'ap-0', normal: 980, blocked: 5, description: '' },
    { latitude: 34.67764, longitude: 110.45105, name: 'ap-2', normal: null, blocked: 7, description: 'Maintenance mode' },
    { latitude: 22.16182, longitude: 113.53505, name: 'ap-3', normal: 361, blocked: undefined, description: undefined },
    { latitude: 37.56508, longitude: 126.91934, name: 'ap-4', normal: 446, blocked: 5, description: null },
    { latitude: 38.31359, longitude: 140.69612, name: 'ap-5', normal: 220, blocked: 6 },
    { latitude: 51.50986, longitude: -0.118092, name: 'astral-azure', normal: 878, blocked: 4 },
    { latitude: 1.35208, longitude: 103.81984, name: 'astral-gcp', normal: 716, blocked: 1 },
    { latitude: 37.49858, longitude: -122.29465, name: 'corp-branch-1', normal: 143, blocked: 8 },
    { latitude: 48.90162, longitude: 2.4153903, name: 'dc-eu-west', normal: 684, blocked: 0 },
    { latitude: 40.74135, longitude: -74.005394, name: 'dc-us-east', normal: 874, blocked: 2 },
    { latitude: 37.44582, longitude: -122.163, name: 'dc-us-west', normal: 974, blocked: 8 },
    { latitude: 51.52857, longitude: -0.2420208, name: 'eu-0', normal: 24289, blocked: 6672 },
    { latitude: 48.85883, longitude: 2.2768495, name: 'eu-1', normal: 554, blocked: 155 },
    { latitude: 38.74362, longitude: -9.195309, name: 'eu-2', normal: 841, blocked: 655 },
    { latitude: 50.12119, longitude: 8.566354, name: 'eu-3', normal: 452, blocked: 0 },
    { latitude: 40.43793, longitude: -3.749747, name: 'eu-4', normal: 343, blocked: 0 },
    { latitude: 41.91005, longitude: 12.465787, name: 'eu-5', normal: 444, blocked: 222 },
    { latitude: 50.05958, longitude: 14.325202, name: 'eu-6', normal: 287, blocked: 5 },
    { latitude: 40.71772, longitude: -74.0083, name: 'nyc', normal: 41, blocked: 8 },
    { latitude: 48.92716, longitude: 2.350664, name: 'par', normal: 498, blocked: 4 },
    { latitude: 48.90105, longitude: 2.423093, name: 'par-2', normal: 626, blocked: 0 },
    { latitude: 1.29594, longitude: 103.788376, name: 'sin', normal: 992, blocked: 0 },
    { latitude: 37.24117, longitude: -121.77938, name: 'sjc', normal: 637, blocked: 3 },
    { latitude: 51.51139, longitude: -0.001787, name: 'lon', normal: 979, blocked: 6 },
    { latitude: 35.62267, longitude: 139.77003, name: 'tky', normal: 174, blocked: 6 },
    { latitude: 40.72916, longitude: -74.00558, name: 'usa-0', normal: 631, blocked: 1 },
    { latitude: 38.90632, longitude: -77.04191, name: 'usa-1', normal: 21, blocked: 0 },
    { latitude: 25.79083, longitude: -80.14021, name: 'usa-2', normal: 487, blocked: 0 },
    { latitude: 30.00407, longitude: -90.15977, name: 'usa-3', normal: 751, blocked: 3 },
    { latitude: 41.89261, longitude: -87.62556, name: 'usa-4', normal: 764, blocked: 3 },
    { latitude: 32.78868, longitude: -97.34767, name: 'usa-5', normal: 0, blocked: 530 },
    { latitude: 36.10304, longitude: -115.17369, name: 'usa-6', normal: 609, blocked: 5 },
    { latitude: 34.10182, longitude: -118.32421, name: 'usa-7', normal: 543, blocked: 0 },
    { latitude: 37.44428, longitude: -122.17108, name: 'usa-8', normal: 1920, blocked: 0 },
    { latitude: 47.61698, longitude: -122.33839, name: 'usa-9', normal: 513, blocked: 2 },
  ],
  areas: [
    { id: 'AW', name: 'Aruba' },
    { id: 'AF', name: 'Afghanistan' },
    { id: 'AO', name: 'Angola' },
    { id: 'AI', name: 'Anguilla' },
    { id: 'AL', name: 'Albania' },
    { id: 'AX', name: 'Åland Islands' },
    { id: 'AD', name: 'Andorra' },
    { id: 'AE', name: 'United Arab Emirates' },
    { id: 'AR', name: 'Argentina' },
    { id: 'AM', name: 'Armenia' },
    { id: 'AS', name: 'American Samoa' },
    { id: 'TF', name: 'French Southern Territories' },
    { id: 'AG', name: 'Antigua and Barbuda' },
    { id: 'AU', name: 'Australia' },
    { id: 'AT', name: 'Austria' },
    { id: 'AZ', name: 'Azerbaijan' },
    { id: 'BI', name: 'Burundi' },
    { id: 'BE', name: 'Belgium' },
    { id: 'BJ', name: 'Benin' },
    { id: 'BF', name: 'Burkina Faso' },
    { id: 'BD', name: 'Bangladesh' },
    { id: 'BG', name: 'Bulgaria' },
    { id: 'BH', name: 'Bahrain' },
    { id: 'BS', name: 'Bahamas' },
    { id: 'BA', name: 'Bosnia and Herzegovina' },
    { id: 'BY', name: 'Belarus' },
    { id: 'BZ', name: 'Belize' },
    { id: 'BM', name: 'Bermuda' },
    { id: 'BO', name: 'Bolivia, Plurinational State of' },
    { id: 'BR', name: 'Brazil' },
    { id: 'BB', name: 'Barbados' },
    { id: 'BN', name: 'Brunei Darussalam' },
    { id: 'BT', name: 'Bhutan' },
    { id: 'BW', name: 'Botswana' },
    { id: 'CF', name: 'Central African Republic' },
    { id: 'CA', name: 'Canada' },
    { id: 'CH', name: 'Switzerland' },
    { id: 'CL', name: 'Chile' },
    { id: 'CN', name: 'China' },
    { id: 'CM', name: 'Cameroon' },
    { id: 'CD', name: 'Congo, the Democratic Republic of the' },
    { id: 'CG', name: 'Congo' },
    { id: 'CK', name: 'Cook Islands' },
    { id: 'CO', name: 'Colombia' },
    { id: 'KM', name: 'Comoros' },
    { id: 'CV', name: 'Cape Verde' },
    { id: 'CR', name: 'Costa Rica' },
    { id: 'CU', name: 'Cuba' },
    { id: 'CW', name: 'Curaçao' },
    { id: 'KY', name: 'Cayman Islands' },
    { id: '', name: 'Northern Cyprus' },
    { id: 'CY', name: 'Cyprus' },
    { id: 'CZ', name: 'Czech Republic' },
    { id: 'DE', name: 'Germany' },
    { id: 'DJ', name: 'Djibouti' },
    { id: 'DM', name: 'Dominica' },
    { id: 'DK', name: 'Denmark' },
    { id: 'DO', name: 'Dominican Republic' },
    { id: 'DZ', name: 'Algeria' },
    { id: 'EC', name: 'Ecuador' },
    { id: 'EG', name: 'Egypt' },
    { id: 'ER', name: 'Eritrea' },
    { id: 'ES', name: 'Spain' },
    { id: 'EE', name: 'Estonia' },
    { id: 'ET', name: 'Ethiopia' },
    { id: 'FI', name: 'Finland' },
    { id: 'FJ', name: 'Fiji' },
    { id: 'FK', name: 'Falkland Islands (Malvinas)' },
    { id: 'FR', name: 'France' },
    { id: 'GF', name: 'French Guyana' },
    { id: 'FO', name: 'Faroe Islands' },
    { id: 'FM', name: 'Micronesia, Federated States of' },
    { id: 'GA', name: 'Gabon' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'GE', name: 'Georgia' },
    { id: 'GG', name: 'Guernsey' },
    { id: 'GH', name: 'Ghana' },
    { id: 'GN', name: 'Guinea' },
    { id: 'GM', name: 'Gambia' },
    { id: 'GW', name: 'Guinea-Bissau' },
    { id: 'GQ', name: 'Equatorial Guinea' },
    { id: 'GR', name: 'Greece' },
    { id: 'GD', name: 'Grenada' },
    { id: 'GL', name: 'Greenland' },
    { id: 'GT', name: 'Guatemala' },
    { id: 'GU', name: 'Guam' },
    { id: 'GY', name: 'Guyana' },
    { id: 'HK', name: 'Hong Kong' },
    { id: 'HM', name: 'Heard Island and McDonald Islands' },
    { id: 'HN', name: 'Honduras' },
    { id: 'HR', name: 'Croatia' },
    { id: 'HT', name: 'Haiti' },
    { id: 'HU', name: 'Hungary' },
    { id: 'ID', name: 'Indonesia' },
    { id: 'IM', name: 'Isle of Man' },
    { id: 'IN', name: 'India' },
    { id: 'CC', name: 'Cocos Islands' },
    { id: 'CX', name: 'Christmas Island' },
    { id: 'IO', name: 'British Indian Ocean Territory' },
    { id: 'IE', name: 'Ireland' },
    { id: 'IR', name: 'Iran, Islamic Republic of' },
    { id: 'IQ', name: 'Iraq' },
    { id: 'IS', name: 'Iceland' },
    { id: 'IL', name: 'Israel' },
    { id: 'IT', name: 'Italy' },
    { id: 'JM', name: 'Jamaica' },
    { id: 'JE', name: 'Jersey' },
    { id: 'JO', name: 'Jordan' },
    { id: 'JP', name: 'Japan' },
    { id: 'KZ', name: 'Kazakhstan' },
    { id: 'KE', name: 'Kenya' },
    { id: 'KG', name: 'Kyrgyzstan' },
    { id: 'KH', name: 'Cambodia' },
    { id: 'KI', name: 'Kiribati' },
    { id: 'KN', name: 'Saint Kitts and Nevis' },
    { id: 'KR', name: 'Korea, Republic of' },
    { id: 'XK', name: 'Kosovo' },
    { id: 'KW', name: 'Kuwait' },
    { id: 'LB', name: 'Lebanon' },
    { id: 'LR', name: 'Liberia' },
    { id: 'LY', name: 'Libya' },
    { id: 'LC', name: 'Saint Lucia' },
    { id: 'LI', name: 'Liechtenstein' },
    { id: 'LK', name: 'Sri Lanka' },
    { id: 'LS', name: 'Lesotho' },
    { id: 'LT', name: 'Lithuania' },
    { id: 'LU', name: 'Luxembourg' },
    { id: 'LV', name: 'Latvia' },
    { id: 'MO', name: 'Macao' },
    { id: 'MF', name: 'Saint Martin (French part)' },
    { id: 'MA', name: 'Morocco' },
    { id: 'MC', name: 'Monaco' },
    { id: 'MD', name: 'Moldova, Republic of' },
    { id: 'MG', name: 'Madagascar' },
    { id: 'MV', name: 'Maldives' },
    { id: 'MX', name: 'Mexico' },
    { id: 'MH', name: 'Marshall Islands' },
    { id: 'MK', name: 'Macedonia, the former Yugoslav Republic of' },
    { id: 'ML', name: 'Mali' },
    { id: 'MT', name: 'Malta' },
    { id: 'MM', name: 'Myanmar' },
    { id: 'ME', name: 'Montenegro' },
    { id: 'MN', name: 'Mongolia' },
    { id: 'MP', name: 'Northern Mariana Islands' },
    { id: 'MZ', name: 'Mozambique' },
    { id: 'MR', name: 'Mauritania' },
    { id: 'MS', name: 'Montserrat' },
    { id: 'MU', name: 'Mauritius' },
    { id: 'MW', name: 'Malawi' },
    { id: 'MY', name: 'Malaysia' },
    { id: 'NA', name: 'Namibia' },
    { id: 'NC', name: 'New Caledonia' },
    { id: 'NE', name: 'Niger' },
    { id: 'NF', name: 'Norfolk Island' },
    { id: 'NG', name: 'Nigeria' },
    { id: 'NI', name: 'Nicaragua' },
    { id: 'NU', name: 'Niue' },
    { id: 'NL', name: 'Netherlands' },
    { id: 'NO', name: 'Norway' },
    { id: 'NP', name: 'Nepal' },
    { id: 'NZ', name: 'New Zealand' },
    { id: 'OM', name: 'Oman' },
    { id: 'PK', name: 'Pakistan' },
    { id: 'PA', name: 'Panama' },
    { id: 'PN', name: 'Pitcairn' },
    { id: 'PE', name: 'Peru' },
    { id: 'PH', name: 'Philippines' },
    { id: 'PW', name: 'Palau' },
    { id: 'PG', name: 'Papua New Guinea' },
    { id: 'PL', name: 'Poland' },
    { id: 'PR', name: 'Puerto Rico' },
    { id: 'PT', name: 'Portugal' },
    { id: 'PY', name: 'Paraguay' },
    { id: 'PF', name: 'French Polynesia' },
    { id: 'QA', name: 'Qatar' },
    { id: 'RO', name: 'Romania' },
    { id: 'RU', name: 'Russian Federation' },
    { id: 'RW', name: 'Rwanda' },
    { id: 'EH', name: 'Western Sahara' },
    { id: 'SA', name: 'Saudi Arabia' },
    { id: 'SD', name: 'Sudan' },
    { id: 'SS', name: 'South Sudan' },
    { id: 'SN', name: 'Senegal' },
    { id: 'SG', name: 'Singapore' },
    { id: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { id: 'SB', name: 'Solomon Islands' },
    { id: 'SL', name: 'Sierra Leone' },
    { id: 'SV', name: 'El Salvador' },
    { id: 'SM', name: 'San Marino' },
    { id: '', name: 'Somaliland' },
    { id: 'SO', name: 'Somalia' },
    { id: 'PM', name: 'Saint Pierre and Miquelon' },
    { id: 'RS', name: 'Serbia' },
    { id: 'ST', name: 'Sao Tome and Principe' },
    { id: 'SR', name: 'Suriname' },
    { id: 'SK', name: 'Slovakia' },
    { id: 'SI', name: 'Slovenia' },
    { id: 'SE', name: 'Sweden' },
    { id: 'SZ', name: 'Swaziland' },
    { id: 'SX', name: 'Sint Maarten (Dutch part)' },
    { id: 'SC', name: 'Seychelles' },
    { id: 'SY', name: 'Syrian Arab Republic' },
    { id: 'TC', name: 'Turks and Caicos Islands' },
    { id: 'TD', name: 'Chad' },
    { id: 'TG', name: 'Togo' },
    { id: 'TH', name: 'Thailand' },
    { id: 'TJ', name: 'Tajikistan' },
    { id: 'TM', name: 'Turkmenistan' },
    { id: 'TL', name: 'Timor-Leste' },
    { id: 'TO', name: 'Tonga' },
    { id: 'TT', name: 'Trinidad and Tobago' },
    { id: 'TN', name: 'Tunisia' },
    { id: 'TR', name: 'Turkey' },
    { id: 'TW', name: 'Taiwan, Province of China' },
    { id: 'TZ', name: 'Tanzania, United Republic of' },
    { id: 'UG', name: 'Uganda' },
    { id: 'UA', name: 'Ukraine' },
    { id: 'UY', name: 'Uruguay' },
    { id: 'US', name: 'United States' },
    { id: 'UZ', name: 'Uzbekistan' },
    { id: 'VC', name: 'Saint Vincent and the Grenadines' },
    { id: 'VE', name: 'Venezuela, Bolivarian Republic of' },
    { id: 'VG', name: 'Virgin Islands, British' },
    { id: 'VI', name: 'Virgin Islands, U.S.' },
    { id: 'VN', name: 'Viet Nam' },
    { id: 'VU', name: 'Vanuatu' },
    { id: 'WF', name: 'Wallis and Futuna' },
    { id: 'WS', name: 'Samoa' },
    { id: 'YE', name: 'Yemen' },
    { id: 'ZA', name: 'South Africa' },
    { id: 'ZM', name: 'Zambia' },
    { id: 'ZW', name: 'Zimbabwe' },
  ],
}

export const totalEvents = data.points.reduce((sum, d) => sum + (d.normal || 0), 0) / data.points.length

export const component = (): React.ReactNode => {
  const mapRef = useRef<VisTopoJSONMapRef<any, DataRecord, any>>(null)
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)
  const [zoomToLocation, setZoomToLocation] = useState<{ coordinates: [number, number]; zoomLevel: number; expandCluster?: boolean } | undefined>(undefined)

  const onZoomIn = (): void => { mapRef.current?.component?.zoomIn(1) }
  const onZoomOut = (): void => { mapRef.current?.component?.zoomOut(1) }
  const onFit = (): void => {
    mapRef.current?.component?.fitView()
    setHighlightedNodeId(null) // Clear highlight when fitting view
    setZoomToLocation(undefined)
  }

  const onZoomToNode = (): void => {
    const targetNode = data.points.find(p => p.name === 'dc-us-east')
    if (!targetNode) return

    // Clear first, then set to ensure the change is detected every time
    setZoomToLocation(undefined)
    setTimeout(() => {
      setZoomToLocation({
        coordinates: [targetNode.longitude, targetNode.latitude],
        zoomLevel: 5,
        expandCluster: true,
      })
    }, 0)

    // Highlight the node (clear first to ensure effect re-runs)
    setHighlightedNodeId(null)
    setTimeout(() => setHighlightedNodeId(targetNode.name), 0)
  }

  // Apply highlight class to the target node and keep it applied during re-renders
  useEffect(() => {
    if (!highlightedNodeId) return

    const applyHighlight = (): void => {
      const pointElement = document.querySelector(`[data-point-id="${highlightedNodeId}"]`)?.parentElement
      if (pointElement && !pointElement.classList.contains('point-highlighted')) {
        pointElement.classList.add('point-highlighted')
      }
    }

    // Wait for zoom animation to complete, then apply highlight
    const timeoutId = setTimeout(applyHighlight, 500)

    // Keep checking and re-applying the highlight (handles map re-renders)
    const intervalId = setInterval(applyHighlight, 100)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      // Remove highlight from all elements when clearing
      document.querySelectorAll('.point-highlighted').forEach(el => {
        el.classList.remove('point-highlighted')
      })
    }
  }, [highlightedNodeId])

  // Fit the map to show all points on initial load
  useEffect(() => {
    if (mapRef.current?.component) {
      mapRef.current.component.fitView()
    }
  }, [])

  const colorMap = {
    normal: { color: '#26BDA4', className: 'normal' },
    blocked: { color: '#9876AA', className: 'blocked' },
  }

  const pointRadius = (d: DataRecord | any): number =>
    10 + 4 * Math.sqrt(((d.normal || 0) + (d.blocked || 0)) / totalEvents)

  const pointLabel = (d: DataRecord | any): string =>
    `${(((d.blocked || 0) + (d.normal || 0)) / 1000).toFixed(1)}K`

  return (<>
    <VisSingleContainer data={data} height={'90vh'}>
      <VisTopoJSONMap<any, DataRecord, any>
        ref={mapRef}
        topojson={WorldMapTopoJSON}
        pointId={d => d.name}
        areaColor={() => 'var(--vis-map-feature-color)'}
        areaLabel={(d: AreaDatum) => d?.name}
        pointRadius={pointRadius}
        pointLabel={pointLabel}
        colorMap={colorMap}
        clustering={true}
        clusteringDistance={25}
        clusterRadius={pointRadius}
        clusterLabel={pointLabel}
        clusterExpandOnClick={true}
        zoomExtent={[0.5, 1000]}
        zoomToLocation={zoomToLocation}
      />
    </VisSingleContainer>
    <div style={{ position: 'absolute', top: 32, right: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={onZoomIn}>Zoom In</button>
      <button onClick={onZoomOut}>Zoom Out</button>
      <button onClick={onFit}>Fit View</button>
      <button onClick={onZoomToNode}>Zoom to Node</button>
    </div>
  </>)
}
