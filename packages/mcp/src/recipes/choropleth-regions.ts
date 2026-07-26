/** Area id lookup tables for the choropleth recipe.
 *
 * The TopoJSONMap joins area data to map features by comparing the feature's
 * `id` with the datum's `id` (string equality), and each map uses a different
 * id scheme:
 *
 *  - world:   ISO 3166-1 alpha-2 codes ('US', 'DE', 'BR')
 *  - usa:     numeric state FIPS codes WITHOUT zero-padding ('6' = California)
 *  - germany / france / india: ISO 3166-2 codes ('DE-BY', 'FR-11', 'IN-MH')
 *  - uk:      GSS statistical region codes ('E15000007' = London)
 *  - china:   'CN-XX' codes that do NOT follow ISO 3166-2 (e.g. the map's
 *             'CN-HA' is Hainan while ISO CN-HA is Henan) — join by name
 *
 * Since several of these are unguessable for tool callers, `resolveArea`
 * accepts codes in common formats (USPS state abbreviations, zero-padded
 * FIPS, bare region codes without the country prefix) as well as area names.
 *
 * Rows are generated from the @unovis/ts map files (feature id +
 * `properties.name`) with hand-curated aliases appended:
 * `[featureId, displayName, ...aliases]`.
 */

export type RegionRow = [string, string, ...string[]]

export type ChoroplethMapKey = 'world' | 'usa' | 'germany' | 'uk' | 'france' | 'india' | 'china'

export interface ChoroplethMapDef {
  /** `{ $unovisMap: marker }` name resolved by the renderer */
  marker: string;
  /** Human description of the accepted id formats, used in error messages */
  idFormat: string;
  /** ISO 3166-2 country prefix tried when a bare region code is given */
  codePrefix?: string;
  /** Feature ids are unpadded numeric strings — accept zero-padded input */
  numericIds?: boolean;
  /** MapProjection factory name; maps whose features cross the antimeridian
   * (USA: the Aleutians) need a composite projection to fit correctly */
  projection?: string;
  regions: RegionRow[];
}

/** Lowercase and strip diacritics/punctuation for tolerant name matching */
export const normalizeKey = (value: string): string => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[-_,.'’()]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const WORLD_REGIONS: RegionRow[] = [
  ['AD', 'Andorra'],
  ['AE', 'United Arab Emirates', 'uae'],
  ['AF', 'Afghanistan'],
  ['AG', 'Antigua and Barbuda'],
  ['AI', 'Anguilla'],
  ['AL', 'Albania'],
  ['AM', 'Armenia'],
  ['AO', 'Angola'],
  ['AR', 'Argentina'],
  ['AS', 'American Samoa'],
  ['AT', 'Austria'],
  ['AU', 'Australia'],
  ['AW', 'Aruba'],
  ['AX', 'Åland Islands'],
  ['AZ', 'Azerbaijan'],
  ['BA', 'Bosnia and Herzegovina'],
  ['BB', 'Barbados'],
  ['BD', 'Bangladesh'],
  ['BE', 'Belgium'],
  ['BF', 'Burkina Faso'],
  ['BG', 'Bulgaria'],
  ['BH', 'Bahrain'],
  ['BI', 'Burundi'],
  ['BJ', 'Benin'],
  ['BM', 'Bermuda'],
  ['BN', 'Brunei Darussalam', 'brunei'],
  ['BO', 'Bolivia, Plurinational State of', 'bolivia'],
  ['BR', 'Brazil'],
  ['BS', 'Bahamas', 'the bahamas'],
  ['BT', 'Bhutan'],
  ['BW', 'Botswana'],
  ['BY', 'Belarus'],
  ['BZ', 'Belize'],
  ['CA', 'Canada'],
  ['CC', 'Cocos Islands'],
  ['CD', 'Congo, the Democratic Republic of the', 'dr congo', 'democratic republic of the congo', 'drc', 'congo kinshasa'],
  ['CF', 'Central African Republic'],
  ['CG', 'Congo', 'republic of the congo', 'congo brazzaville'],
  ['CH', 'Switzerland'],
  ['CI', 'Côte d\'Ivoire', 'ivory coast'],
  ['CK', 'Cook Islands'],
  ['CL', 'Chile'],
  ['CM', 'Cameroon'],
  ['CN', 'China'],
  ['CO', 'Colombia'],
  ['CR', 'Costa Rica'],
  ['CU', 'Cuba'],
  ['CV', 'Cape Verde', 'cabo verde'],
  ['CW', 'Curaçao'],
  ['CX', 'Christmas Island'],
  ['CY', 'Cyprus'],
  ['CZ', 'Czech Republic', 'czechia'],
  ['DE', 'Germany'],
  ['DJ', 'Djibouti'],
  ['DK', 'Denmark'],
  ['DM', 'Dominica'],
  ['DO', 'Dominican Republic'],
  ['DZ', 'Algeria'],
  ['EC', 'Ecuador'],
  ['EE', 'Estonia'],
  ['EG', 'Egypt'],
  ['EH', 'Western Sahara'],
  ['ER', 'Eritrea'],
  ['ES', 'Spain'],
  ['ET', 'Ethiopia'],
  ['FI', 'Finland'],
  ['FJ', 'Fiji'],
  ['FK', 'Falkland Islands (Malvinas)', 'falkland islands'],
  ['FM', 'Micronesia, Federated States of', 'micronesia'],
  ['FO', 'Faroe Islands'],
  ['FR', 'France'],
  ['GA', 'Gabon'],
  ['GB', 'United Kingdom', 'uk', 'great britain', 'britain', 'england'],
  ['GD', 'Grenada'],
  ['GE', 'Georgia'],
  ['GF', 'French Guyana'],
  ['GG', 'Guernsey'],
  ['GH', 'Ghana'],
  ['GL', 'Greenland'],
  ['GM', 'Gambia', 'the gambia'],
  ['GN', 'Guinea'],
  ['GQ', 'Equatorial Guinea'],
  ['GR', 'Greece'],
  ['GT', 'Guatemala'],
  ['GU', 'Guam'],
  ['GW', 'Guinea-Bissau'],
  ['GY', 'Guyana'],
  ['HK', 'Hong Kong'],
  ['HM', 'Heard Island and McDonald Islands'],
  ['HN', 'Honduras'],
  ['HR', 'Croatia'],
  ['HT', 'Haiti'],
  ['HU', 'Hungary'],
  ['ID', 'Indonesia'],
  ['IE', 'Ireland'],
  ['IL', 'Israel'],
  ['IM', 'Isle of Man'],
  ['IN', 'India'],
  ['IO', 'British Indian Ocean Territory'],
  ['IQ', 'Iraq'],
  ['IR', 'Iran, Islamic Republic of', 'iran'],
  ['IS', 'Iceland'],
  ['IT', 'Italy'],
  ['JE', 'Jersey'],
  ['JM', 'Jamaica'],
  ['JO', 'Jordan'],
  ['JP', 'Japan'],
  ['KE', 'Kenya'],
  ['KG', 'Kyrgyzstan'],
  ['KH', 'Cambodia'],
  ['KI', 'Kiribati'],
  ['KM', 'Comoros'],
  ['KN', 'Saint Kitts and Nevis', 'saint kitts'],
  ['KP', 'Korea, Democratic People\'s Republic of', 'north korea'],
  ['KR', 'Korea, Republic of', 'south korea', 'korea'],
  ['KW', 'Kuwait'],
  ['KY', 'Cayman Islands'],
  ['KZ', 'Kazakhstan'],
  ['LA', 'Lao People\'s Democratic Republic', 'laos'],
  ['LB', 'Lebanon'],
  ['LC', 'Saint Lucia'],
  ['LI', 'Liechtenstein'],
  ['LK', 'Sri Lanka'],
  ['LR', 'Liberia'],
  ['LS', 'Lesotho'],
  ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'],
  ['LV', 'Latvia'],
  ['LY', 'Libya'],
  ['MA', 'Morocco'],
  ['MC', 'Monaco'],
  ['MD', 'Moldova, Republic of', 'moldova'],
  ['ME', 'Montenegro'],
  ['MF', 'Saint Martin (French part)'],
  ['MG', 'Madagascar'],
  ['MH', 'Marshall Islands'],
  ['MK', 'Macedonia, the former Yugoslav Republic of', 'macedonia', 'north macedonia'],
  ['ML', 'Mali'],
  ['MM', 'Myanmar', 'burma'],
  ['MN', 'Mongolia'],
  ['MO', 'Macao', 'macau'],
  ['MP', 'Northern Mariana Islands'],
  ['MR', 'Mauritania'],
  ['MS', 'Montserrat'],
  ['MT', 'Malta'],
  ['MU', 'Mauritius'],
  ['MV', 'Maldives'],
  ['MW', 'Malawi'],
  ['MX', 'Mexico'],
  ['MY', 'Malaysia'],
  ['MZ', 'Mozambique'],
  ['NA', 'Namibia'],
  ['NC', 'New Caledonia'],
  ['NE', 'Niger'],
  ['NF', 'Norfolk Island'],
  ['NG', 'Nigeria'],
  ['NI', 'Nicaragua'],
  ['NL', 'Netherlands', 'holland'],
  ['NO', 'Norway'],
  ['NP', 'Nepal'],
  ['NU', 'Niue'],
  ['NZ', 'New Zealand'],
  ['OM', 'Oman'],
  ['PA', 'Panama'],
  ['PE', 'Peru'],
  ['PF', 'French Polynesia'],
  ['PG', 'Papua New Guinea'],
  ['PH', 'Philippines'],
  ['PK', 'Pakistan'],
  ['PL', 'Poland'],
  ['PM', 'Saint Pierre and Miquelon'],
  ['PN', 'Pitcairn'],
  ['PR', 'Puerto Rico'],
  ['PT', 'Portugal'],
  ['PW', 'Palau'],
  ['PY', 'Paraguay'],
  ['QA', 'Qatar'],
  ['RO', 'Romania'],
  ['RS', 'Serbia'],
  ['RU', 'Russian Federation', 'russia'],
  ['RW', 'Rwanda'],
  ['SA', 'Saudi Arabia'],
  ['SB', 'Solomon Islands'],
  ['SC', 'Seychelles'],
  ['SD', 'Sudan'],
  ['SE', 'Sweden'],
  ['SG', 'Singapore'],
  ['SH', 'Saint Helena, Ascension and Tristan da Cunha', 'saint helena'],
  ['SI', 'Slovenia'],
  ['SK', 'Slovakia'],
  ['SL', 'Sierra Leone'],
  ['SM', 'San Marino'],
  ['SN', 'Senegal'],
  ['SO', 'Somalia'],
  ['SR', 'Suriname'],
  ['SS', 'South Sudan'],
  ['ST', 'Sao Tome and Principe'],
  ['SV', 'El Salvador'],
  ['SX', 'Sint Maarten (Dutch part)'],
  ['SY', 'Syrian Arab Republic', 'syria'],
  ['SZ', 'Swaziland', 'eswatini'],
  ['TC', 'Turks and Caicos Islands'],
  ['TD', 'Chad'],
  ['TF', 'French Southern Territories'],
  ['TG', 'Togo'],
  ['TH', 'Thailand'],
  ['TJ', 'Tajikistan'],
  ['TL', 'Timor-Leste', 'east timor'],
  ['TM', 'Turkmenistan'],
  ['TN', 'Tunisia'],
  ['TO', 'Tonga'],
  ['TR', 'Turkey', 'turkiye'],
  ['TT', 'Trinidad and Tobago'],
  ['TW', 'Taiwan, Province of China', 'taiwan'],
  ['TZ', 'Tanzania, United Republic of', 'tanzania'],
  ['UA', 'Ukraine'],
  ['UG', 'Uganda'],
  ['US', 'United States', 'usa', 'united states of america', 'america'],
  ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'],
  ['VC', 'Saint Vincent and the Grenadines', 'saint vincent'],
  ['VE', 'Venezuela, Bolivarian Republic of', 'venezuela'],
  ['VG', 'Virgin Islands, British', 'british virgin islands'],
  ['VI', 'Virgin Islands, U.S.', 'us virgin islands'],
  ['VN', 'Viet Nam', 'vietnam'],
  ['VU', 'Vanuatu'],
  ['WF', 'Wallis and Futuna'],
  ['WS', 'Samoa'],
  ['XK', 'Kosovo'],
  ['YE', 'Yemen'],
  ['ZA', 'South Africa'],
  ['ZM', 'Zambia'],
  ['ZW', 'Zimbabwe'],
]

const USA_REGIONS: RegionRow[] = [
  ['1', 'Alabama', 'AL'],
  ['2', 'Alaska', 'AK'],
  ['4', 'Arizona', 'AZ'],
  ['5', 'Arkansas', 'AR'],
  ['6', 'California', 'CA'],
  ['8', 'Colorado', 'CO'],
  ['9', 'Connecticut', 'CT'],
  ['10', 'Delaware', 'DE'],
  ['11', 'District of Columbia', 'DC', 'washington dc', 'washington d c'],
  ['12', 'Florida', 'FL'],
  ['13', 'Georgia', 'GA'],
  ['15', 'Hawaii', 'HI'],
  ['16', 'Idaho', 'ID'],
  ['17', 'Illinois', 'IL'],
  ['18', 'Indiana', 'IN'],
  ['19', 'Iowa', 'IA'],
  ['20', 'Kansas', 'KS'],
  ['21', 'Kentucky', 'KY'],
  ['22', 'Louisiana', 'LA'],
  ['23', 'Maine', 'ME'],
  ['24', 'Maryland', 'MD'],
  ['25', 'Massachusetts', 'MA'],
  ['26', 'Michigan', 'MI'],
  ['27', 'Minnesota', 'MN'],
  ['28', 'Mississippi', 'MS'],
  ['29', 'Missouri', 'MO'],
  ['30', 'Montana', 'MT'],
  ['31', 'Nebraska', 'NE'],
  ['32', 'Nevada', 'NV'],
  ['33', 'New Hampshire', 'NH'],
  ['34', 'New Jersey', 'NJ'],
  ['35', 'New Mexico', 'NM'],
  ['36', 'New York', 'NY'],
  ['37', 'North Carolina', 'NC'],
  ['38', 'North Dakota', 'ND'],
  ['39', 'Ohio', 'OH'],
  ['40', 'Oklahoma', 'OK'],
  ['41', 'Oregon', 'OR'],
  ['42', 'Pennsylvania', 'PA'],
  ['44', 'Rhode Island', 'RI'],
  ['45', 'South Carolina', 'SC'],
  ['46', 'South Dakota', 'SD'],
  ['47', 'Tennessee', 'TN'],
  ['48', 'Texas', 'TX'],
  ['49', 'Utah', 'UT'],
  ['50', 'Vermont', 'VT'],
  ['51', 'Virginia', 'VA'],
  ['53', 'Washington', 'WA'],
  ['54', 'West Virginia', 'WV'],
  ['55', 'Wisconsin', 'WI'],
  ['56', 'Wyoming', 'WY'],
]

const GERMANY_REGIONS: RegionRow[] = [
  ['DE-BB', 'Brandenburg'],
  ['DE-BE', 'Berlin'],
  ['DE-BW', 'Baden-Württemberg'],
  ['DE-BY', 'Bayern', 'bavaria'],
  ['DE-HB', 'Bremen'],
  ['DE-HE', 'Hessen', 'hesse'],
  ['DE-HH', 'Hamburg'],
  ['DE-MV', 'Mecklenburg-Vorpommern', 'mecklenburg western pomerania', 'mecklenburg west pomerania'],
  ['DE-NI', 'Niedersachsen', 'lower saxony'],
  ['DE-NW', 'Nordrhein-Westfalen', 'north rhine westphalia', 'nrw'],
  ['DE-RP', 'Rheinland-Pfalz', 'rhineland palatinate'],
  ['DE-SH', 'Schleswig-Holstein'],
  ['DE-SL', 'Saarland'],
  ['DE-SN', 'Sachsen', 'saxony'],
  ['DE-ST', 'Sachsen-Anhalt', 'saxony anhalt'],
  ['DE-TH', 'Thüringen', 'thuringia'],
]

const UK_REGIONS: RegionRow[] = [
  ['E15000001', 'North East England'],
  ['E15000002', 'North West England'],
  ['E15000003', 'Yorkshire and the Humber', 'yorkshire'],
  ['E15000004', 'East Midlands'],
  ['E15000005', 'West Midlands'],
  ['E15000006', 'East of England', 'east anglia'],
  ['E15000007', 'London', 'greater london'],
  ['E15000008', 'South East England'],
  ['E15000009', 'South West England and Gibraltar', 'south west england'],
  ['N07000001', 'Northern Ireland'],
  ['S15000001', 'Scotland'],
  ['W08000001', 'Wales'],
]

const FRANCE_REGIONS: RegionRow[] = [
  ['FR-11', 'Île-de-France', 'paris region'],
  ['FR-24', 'Centre-Val de Loire'],
  ['FR-27', 'Bourgogne-Franche-Comté', 'burgundy franche comte'],
  ['FR-28', 'Normandie', 'normandy'],
  ['FR-32', 'Hauts-de-France'],
  ['FR-44', 'Grand Est'],
  ['FR-52', 'Pays de la Loire'],
  ['FR-53', 'Bretagne', 'brittany'],
  ['FR-75', 'Nouvelle-Aquitaine', 'new aquitaine'],
  ['FR-76', 'Occitanie', 'occitania'],
  ['FR-84', 'Auvergne-Rhône-Alpes'],
  ['FR-93', 'Provence-Alpes-Côte d\'Azur', 'paca', 'provence'],
  ['FR-94', 'Corse', 'corsica'],
]

const INDIA_REGIONS: RegionRow[] = [
  ['IN-AN', 'Andaman and Nicobar Islands'],
  ['IN-AP', 'Andhra Pradesh'],
  ['IN-AR', 'Arunachal Pradesh'],
  ['IN-AS', 'Assam'],
  ['IN-BR', 'Bihar'],
  ['IN-CH', 'Chandigarh'],
  ['IN-CT', 'Chhattisgarh', 'chattisgarh'],
  ['IN-DD', 'Dadra and Nagar Haveli and Daman and Diu'],
  ['IN-DL', 'Delhi', 'new delhi'],
  ['IN-GA', 'Goa'],
  ['IN-GJ', 'Gujarat'],
  ['IN-HP', 'Himachal Pradesh'],
  ['IN-HR', 'Haryana'],
  ['IN-JH', 'Jharkhand'],
  ['IN-JK', 'Jammu and Kashmir'],
  ['IN-KA', 'Karnataka'],
  ['IN-KL', 'Kerala'],
  ['IN-LA', 'Ladakh'],
  ['IN-LD', 'Lakshadweep'],
  ['IN-MH', 'Maharashtra'],
  ['IN-ML', 'Meghalaya'],
  ['IN-MN', 'Manipur'],
  ['IN-MP', 'Madhya Pradesh'],
  ['IN-MZ', 'Mizoram'],
  ['IN-NL', 'Nagaland'],
  ['IN-OR', 'Odisha', 'orissa'],
  ['IN-PB', 'Punjab'],
  ['IN-PY', 'Puducherry', 'pondicherry'],
  ['IN-RJ', 'Rajasthan'],
  ['IN-SK', 'Sikkim'],
  ['IN-TG', 'Telangana'],
  ['IN-TN', 'Tamil Nadu'],
  ['IN-TR', 'Tripura'],
  ['IN-UP', 'Uttar Pradesh'],
  ['IN-UT', 'Uttarakhand', 'uttaranchal'],
  ['IN-WB', 'West Bengal'],
]

const CHINA_REGIONS: RegionRow[] = [
  ['CN-AH', 'Anhui'],
  ['CN-BJ', 'Beijing'],
  ['CN-CQ', 'Chongqing'],
  ['CN-FJ', 'Fujian'],
  ['CN-GD', 'Guangdong'],
  ['CN-GS', 'Gansu'],
  ['CN-GX', 'Guangxi'],
  ['CN-GZ', 'Guizhou'],
  ['CN-HA', 'Hainan'],
  ['CN-HB', 'Hebei'],
  ['CN-HE', 'Henan'],
  ['CN-HL', 'Heilongjiang'],
  ['CN-HN', 'Hunan'],
  ['CN-HU', 'Hubei'],
  ['CN-JL', 'Jilin'],
  ['CN-JS', 'Jiangsu'],
  ['CN-JX', 'Jiangxi'],
  ['CN-LN', 'Liaoning'],
  ['CN-NM', 'Inner Mongol', 'inner mongolia', 'nei mongol'],
  ['CN-NX', 'Ningxia'],
  ['CN-QH', 'Qinghai'],
  ['CN-SA', 'Shaanxi'],
  ['CN-SC', 'Sichuan'],
  ['CN-SD', 'Shandong'],
  ['CN-SH', 'Shanghai'],
  ['CN-SX', 'Shanxi'],
  ['CN-TJ', 'Tianjin'],
  ['CN-XJ', 'Xinjiang'],
  ['CN-XZ', 'Xizang', 'tibet'],
  ['CN-YN', 'Yunnan'],
  ['CN-ZJ', 'Zhejiang'],
]

export const choroplethMaps: Record<ChoroplethMapKey, ChoroplethMapDef> = {
  world: {
    marker: 'WorldMapTopoJSON',
    idFormat: 'an ISO 3166-1 alpha-2 country code (e.g. "US", "DE", "BR") or an English country name',
    regions: WORLD_REGIONS,
  },
  usa: {
    marker: 'USATopoJSON',
    idFormat: 'a US state name, USPS abbreviation (e.g. "CA") or FIPS code — 50 states plus the District of Columbia',
    numericIds: true,
    projection: 'AlbersUsa',
    regions: USA_REGIONS,
  },
  germany: {
    marker: 'GermanyTopoJSON',
    idFormat: 'an ISO 3166-2 code (e.g. "DE-BY" or "BY") or a state name (e.g. "Bavaria", "Sachsen")',
    codePrefix: 'DE',
    regions: GERMANY_REGIONS,
  },
  uk: {
    marker: 'UKTopoJSON',
    idFormat: 'a UK country/region name (e.g. "Scotland", "Wales", "London", "North West England")',
    regions: UK_REGIONS,
  },
  france: {
    marker: 'FranceTopoJSON',
    idFormat: 'an ISO 3166-2 region code (e.g. "FR-11" or "11") or a metropolitan region name (e.g. "Bretagne", "Normandy")',
    codePrefix: 'FR',
    regions: FRANCE_REGIONS,
  },
  india: {
    marker: 'IndiaTopoJSON',
    idFormat: 'an ISO 3166-2 code (e.g. "IN-MH" or "MH") or a state/territory name (e.g. "Maharashtra")',
    codePrefix: 'IN',
    regions: INDIA_REGIONS,
  },
  china: {
    marker: 'ChinaTopoJSON',
    idFormat: 'a province name (e.g. "Guangdong", "Beijing") — prefer names over codes, this map\'s CN-XX codes do not follow ISO 3166-2',
    codePrefix: 'CN',
    regions: CHINA_REGIONS,
  },
}

export interface ResolvedArea {
  /** The map feature id the TopoJSONMap joins on */
  id: string;
  /** Canonical display name of the area */
  name: string;
}

interface MapIndex {
  byId: Map<string, ResolvedArea>;
  byName: Map<string, ResolvedArea>;
}

const indices = new Map<ChoroplethMapKey, MapIndex>()

function indexFor (map: ChoroplethMapKey): MapIndex {
  const cached = indices.get(map)
  if (cached) return cached
  const byId = new Map<string, ResolvedArea>()
  const byName = new Map<string, ResolvedArea>()
  for (const [id, name, ...aliases] of choroplethMaps[map].regions) {
    const area: ResolvedArea = { id, name }
    byId.set(id.toUpperCase(), area)
    byName.set(normalizeKey(name), area)
    for (const alias of aliases) byName.set(normalizeKey(alias), area)
  }
  const index = { byId, byName }
  indices.set(map, index)
  return index
}

/** Resolve a user-supplied area id (code in common formats, or name) to the
 * map's feature id. Returns undefined when nothing matches. */
export function resolveArea (map: ChoroplethMapKey, rawId: string): ResolvedArea | undefined {
  const def = choroplethMaps[map]
  const { byId, byName } = indexFor(map)
  const raw = rawId.trim()
  const upper = raw.toUpperCase()

  const direct = byId.get(upper)
  if (direct) return direct

  // Zero-padded FIPS codes ('06' → '6')
  if (def.numericIds && /^\d+$/.test(raw)) {
    const unpadded = byId.get(String(parseInt(raw, 10)))
    if (unpadded) return unpadded
  }

  // Bare region codes without the country prefix ('BY' → 'DE-BY')
  if (def.codePrefix && /^[A-Z]{2}$/.test(upper)) {
    const prefixed = byId.get(`${def.codePrefix}-${upper}`)
    if (prefixed) return prefixed
  }

  return byName.get(normalizeKey(raw))
}
