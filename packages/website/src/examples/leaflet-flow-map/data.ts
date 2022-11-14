export type MapPointDataRecord = { id: string; lat: number; lon: number }
export type MapFlowDataRecord = {
  sourceLat: number;
  sourceLon: number;
  targetLat: number;
  targetLon: number;
  particleDensity: number;
}

export const points: MapPointDataRecord[] = [
  { id: 'SVN', lat: 32.00999832, lon: -81.14569855 },
  { id: 'CTB', lat: 48.6083984375, lon: -112.375999451 },
  { id: 'HHI', lat: 21.48349953, lon: -158.0399933 },
  { id: 'GRF', lat: 47.07920074, lon: -122.5810013 },
  { id: 'HRL', lat: 26.2285003662109, lon: -97.6544036865234 },
  { id: 'HPN', lat: 41.0670013427734, lon: -73.7076034545898 },
  { id: 'MNM', lat: 45.1267013549805, lon: -87.6383972167969 },
  { id: 'PMB', lat: 48.9425010681, lon: -97.2407989502 },
  { id: 'TYS', lat: 35.81100082, lon: -83.9940033 },
  { id: 'FTK', lat: 37.9071006775, lon: -85.9720993042 },
  { id: 'ROW', lat: 33.3016014099121, lon: -104.53099822998 },
  { id: 'MWL', lat: 32.7816009521, lon: -98.0602035522 },
  { id: 'MUI', lat: 40.43479919, lon: -76.56939697 },
  { id: 'BDL', lat: 41.9388999939, lon: -72.6831970215 },
  { id: 'WRB', lat: 32.6400985718, lon: -83.5919036865 },
  { id: 'GSP', lat: 34.8956985474, lon: -82.2189025879 },
  { id: 'RDD', lat: 40.50899887, lon: -122.2929993 },
  { id: 'BKD', lat: 32.71900177, lon: -98.8909988403 },
  { id: 'MEI', lat: 32.3325996398926, lon: -88.7518997192383 },
  { id: 'BKW', lat: 37.7873001099, lon: -81.1241989136 },
  { id: 'MKG', lat: 43.16949844, lon: -86.23819733 },
  { id: 'HNS', lat: 59.2438011169434, lon: -135.524002075195 },
  { id: 'HPB', lat: 61.52389908, lon: -166.1470032 },
  { id: 'LAF', lat: 40.4123001098633, lon: -86.936897277832 },
  { id: 'MTH', lat: 24.72610092, lon: -81.05139923 },
  { id: 'KMO', lat: 58.9902000427, lon: -159.050003052 },
  { id: 'NIB', lat: 63.0186004638672, lon: -154.358001708984 },
  { id: 'DGL', lat: 31.3425998688, lon: -109.505996704 },
  { id: 'RYY', lat: 34.01319885, lon: -84.59860229 },
  { id: 'DUC', lat: 34.47090149, lon: -97.9598999 },
  { id: 'DVT', lat: 33.6883010864, lon: -112.083000183 },
  { id: 'WST', lat: 41.3496017456, lon: -71.8033981323 },
  { id: 'GAD', lat: 33.972599, lon: -86.088996 },
  { id: 'RAC', lat: 42.7606010437, lon: -87.8152008057 },
  { id: 'LBT', lat: 34.6099014282, lon: -79.0594024658 },
  { id: 'HDI', lat: 35.220100402832, lon: -84.8323974609375 },
  { id: 'TIX', lat: 28.514799118042, lon: -80.799201965332 },
  { id: 'CUB', lat: 33.970500946, lon: -80.9952011108 },
  { id: 'LGD', lat: 45.2901992798, lon: -118.007003784 },
  { id: 'DAA', lat: 38.7150001526, lon: -77.1809997559 },
  { id: 'SUZ', lat: 34.59059906, lon: -92.47940063 },
]

export const connections = [
  ['HPB', 'NIB'],
  ['KMO', 'HNS'],
  ['NIB', 'KMO'],
  ['HNS', 'WST'],
  ['HHI', 'MKG'],
  ['HHI', 'RDD'],
  ['HNS', 'DVT'],
  ['DVT', 'MEI'],
  ['GRF', 'CTB'],
  ['CTB', 'PMB'],
]

export const flows: MapFlowDataRecord[] = connections.map(c => {
  const sourcePoint = points.find(d => d.id === c[0])
  const targetPoint = points.find(d => d.id === c[1])
  return {
    sourceLat: sourcePoint.lat,
    sourceLon: sourcePoint.lon,
    targetLat: targetPoint.lat,
    targetLon: targetPoint.lon,
    particleDensity: 0.8 + Math.random() / 5,
  }
})

export const data = { points, flows }
