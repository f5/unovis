export type DataRecord = {
  year: number;
  bra: number;
  can: number;
  chn: number;
  fra: number;
  idn: number;
  ind: number;
  rus: number;
  usa: number;
}

export type GroupItem = {
  key: keyof DataRecord;
  name: string;
}

export const groups: GroupItem[] = [
  { key: 'bra', name: 'Brazil' },
  { key: 'can', name: 'Canada' },
  { key: 'chn', name: 'China' },
  { key: 'fra', name: 'France' },
  { key: 'idn', name: 'Indonesia' },
  { key: 'ind', name: 'India' },
  { key: 'rus', name: 'Russian Federation' },
  { key: 'usa', name: 'United States' },
]

export const data: DataRecord[] = [
  {
    year: 1961,
    bra: 15.036353,
    can: 16.730306,
    chn: 109.659976,
    fra: 20.802475,
    idn: 14.3671,
    ind: 87.376496,
    rus: null,
    usa: 163.619978,
  },
  {
    year: 1962,
    bra: 15.918336,
    can: 29.26125,
    chn: 120.421293,
    fra: 25.305105,
    idn: 16.2469,
    ind: 87.257552,
    rus: null,
    usa: 162.45578,
  },
  {
    year: 1963,
    bra: 16.616892,
    can: 34.122307,
    chn: 137.456233,
    fra: 25.367307,
    idn: 13.9528,
    ind: 90.373008,
    rus: null,
    usa: 174.812487,
  },
  {
    year: 1964,
    bra: 16.469226,
    can: 28.504578,
    chn: 152.356625,
    fra: 26.05047,
    idn: 16.0746,
    ind: 93.706,
    rus: null,
    usa: 160.937079,
  },
  {
    year: 1965,
    bra: 20.350793,
    can: 32.228771,
    chn: 162.156281,
    fra: 29.130754,
    idn: 15.3395,
    ind: 79.699504,
    rus: null,
    usa: 183.602617,
  },
  {
    year: 1966,
    bra: 17.867924,
    can: 38.663261,
    chn: 177.613486,
    fra: 26.737646,
    idn: 17.3674,
    ind: 80.137608,
    rus: null,
    usa: 184.44488,
  },
  {
    year: 1967,
    bra: 20.322328,
    can: 30.080426,
    chn: 181.182167,
    fra: 32.345675,
    idn: 15.591101,
    ind: 95.453504,
    rus: null,
    usa: 208.158055,
  },
  {
    year: 1968,
    bra: 20.418801,
    can: 34.413439,
    chn: 177.133015,
    fra: 33.237542,
    idn: 20.32885,
    ind: 102.443708,
    rus: null,
    usa: 202.538423,
  },
  {
    year: 1969,
    bra: 20.54986,
    can: 35.922333,
    chn: 176.486754,
    fra: 33.115628,
    idn: 20.31308,
    ind: 106.291244,
    rus: null,
    usa: 205.28817,
  },
  {
    year: 1970,
    bra: 23.698316,
    can: 28.560715,
    chn: 200.836854,
    fra: 31.44342,
    idn: 22.15622,
    ind: 113.909504,
    rus: null,
    usa: 186.860751,
  },
  {
    year: 1971,
    bra: 22.814265,
    can: 38.85975,
    chn: 212.14276,
    fra: 36.98861,
    idn: 22.79649,
    ind: 113.238296,
    rus: null,
    usa: 237.624461,
  },
  {
    year: 1972,
    bra: 22.703928,
    can: 35.466355,
    chn: 206.516977,
    fra: 40.48182,
    idn: 21.64798,
    ind: 108.615456,
    rus: null,
    usa: 228.117866,
  },
  {
    year: 1973,
    bra: 23.721606,
    can: 36.600202,
    chn: 221.853449,
    fra: 43.053408,
    idn: 25.1793,
    ind: 119.648216,
    rus: null,
    usa: 237.683006,
  },
  {
    year: 1974,
    bra: 26.240014,
    can: 30.864826,
    chn: 234.63687,
    fra: 41.069978,
    idn: 25.483788,
    ind: 106.793,
    rus: null,
    usa: 204.617505,
  },
  {
    year: 1975,
    bra: 26.238419,
    can: 37.107574,
    chn: 244.525529,
    fra: 35.73189,
    idn: 25.24209,
    ind: 127.8078,
    rus: null,
    usa: 249.283743,
  },
  {
    year: 1976,
    bra: 31.1432,
    can: 44.710278,
    chn: 250.213735,
    fra: 32.72907,
    idn: 25.873084,
    ind: 121.625108,
    rus: null,
    usa: 258.200097,
  },
  {
    year: 1977,
    bra: 30.913834,
    can: 42.239008,
    chn: 243.286035,
    fra: 39.31614,
    idn: 26.489786,
    ind: 138.062904,
    rus: null,
    usa: 266.014469,
  },
  {
    year: 1978,
    bra: 24.033646,
    can: 41.895782,
    chn: 273.038118,
    fra: 45.454526,
    idn: 29.8008,
    ind: 142.964696,
    rus: null,
    usa: 276.602542,
  },
  {
    year: 1979,
    bra: 27.147322,
    can: 35.955,
    chn: 292.727509,
    fra: 44.266904,
    idn: 29.888191,
    ind: 126.470304,
    rus: null,
    usa: 302.62558,
  },
  {
    year: 1980,
    bra: 33.217492,
    can: 41.3647,
    chn: 280.287437,
    fra: 48.024778,
    idn: 33.642843,
    ind: 140.4906,
    rus: null,
    usa: 269.883982,
  },
  {
    year: 1981,
    bra: 32.050567,
    can: 50.8622,
    chn: 286.450038,
    fra: 45.9417,
    idn: 37.283478,
    ind: 147.583816,
    rus: null,
    usa: 330.889528,
  },
  {
    year: 1982,
    bra: 33.838263,
    can: 53.333208,
    chn: 315.36405,
    fra: 48.6685,
    idn: 36.818521,
    ind: 136.101404,
    rus: null,
    usa: 333.103755,
  },
  {
    year: 1983,
    bra: 29.197566,
    can: 47.447208,
    chn: 345.626506,
    fra: 46.397398,
    idn: 40.389883,
    ind: 166.781704,
    rus: null,
    usa: 207.657604,
  },
  {
    year: 1984,
    bra: 32.711289,
    can: 42.793504,
    chn: 365.937335,
    fra: 58.14429,
    idn: 43.424273,
    ind: 164.4776,
    rus: null,
    usa: 314.7495,
  },
  {
    year: 1985,
    bra: 36.011139,
    can: 48.2393,
    chn: 339.877377,
    fra: 55.68418,
    idn: 43.362447,
    ind: 165.682196,
    rus: null,
    usa: 347.118216,
  },
  {
    year: 1986,
    bra: 37.2984,
    can: 56.9647,
    chn: 352.084647,
    fra: 50.373694,
    idn: 45.647142,
    ind: 164.955216,
    rus: null,
    usa: 315.331216,
  },
  {
    year: 1987,
    bra: 44.148398,
    can: 51.6352,
    chn: 359.240676,
    fra: 52.939096,
    idn: 45.233872,
    ind: 156.1145,
    rus: null,
    usa: 280.494047,
  },
  {
    year: 1988,
    bra: 42.905037,
    can: 35.4942,
    chn: 351.82429,
    fra: 56.071405,
    idn: 48.328093,
    ind: 183.867008,
    rus: null,
    usa: 206.5281,
  },
  {
    year: 1989,
    bra: 43.93441,
    can: 48.089308,
    chn: 367.63608,
    fra: 57.603036,
    idn: 50.918096,
    ind: 199.413216,
    rus: null,
    usa: 284.238058,
  },
  {
    year: 1990,
    bra: 32.49039,
    can: 56.806235,
    chn: 404.719096,
    fra: 55.110621,
    idn: 51.91278,
    ind: 193.919312,
    rus: null,
    usa: 312.410604,
  },
  {
    year: 1991,
    bra: 36.682063,
    can: 53.8523,
    chn: 398.896071,
    fra: 60.262166,
    idn: 50.944146,
    ind: 193.101196,
    rus: null,
    usa: 280.063391,
  },
  {
    year: 1992,
    bra: 44.057994,
    can: 49.64265,
    chn: 404.275226,
    fra: 60.473755,
    idn: 56.235467,
    ind: 201.468404,
    rus: 103.79399,
    usa: 353.025147,
  },
  {
    year: 1993,
    bra: 43.073467,
    can: 51.4831,
    chn: 407.930462,
    fra: 55.422572,
    idn: 54.640825,
    ind: 208.6269,
    rus: 96.225194,
    usa: 259.105342,
  },
  {
    year: 1994,
    bra: 45.845332,
    can: 46.6185,
    chn: 396.46012,
    fra: 53.185122,
    idn: 53.51038,
    ind: 211.9414,
    rus: 78.650928,
    usa: 355.934924,
  },
  {
    year: 1995,
    bra: 49.641823,
    can: 49.3442,
    chn: 418.664201,
    fra: 53.284874,
    idn: 57.990042,
    ind: 210.0125,
    rus: 61.90184,
    usa: 277.60121,
  },
  {
    year: 1996,
    bra: 42.43696,
    can: 58.4941,
    chn: 453.4393,
    fra: 62.25351,
    idn: 60.408927,
    ind: 218.7509,
    rus: 67.441814,
    usa: 335.780123,
  },
  {
    year: 1997,
    bra: 44.87482,
    can: 49.6069,
    chn: 445.931409,
    fra: 63.031639,
    idn: 58.147907,
    ind: 223.2324,
    rus: 86.710503,
    usa: 336.582161,
  },
  {
    year: 1998,
    bra: 40.742023,
    can: 50.9845,
    chn: 458.394739,
    fra: 67.947149,
    idn: 59.406188,
    ind: 226.877,
    rus: 46.853327,
    usa: 349.425744,
  },
  {
    year: 1999,
    bra: 47.631962,
    can: 54.1126,
    chn: 455.192431,
    fra: 64.264518,
    idn: 60.070424,
    ind: 236.205608,
    rus: 53.778631,
    usa: 335.364364,
  },
  {
    year: 2000,
    bra: 46.527202,
    can: 51.0904,
    chn: 407.336509,
    fra: 65.732235,
    idn: 61.575,
    ind: 234.931192,
    rus: 64.242691,
    usa: 342.631506,
  },
  {
    year: 2001,
    bra: 57.125393,
    can: 43.3914,
    chn: 398.396811,
    fra: 60.300838,
    idn: 59.808,
    ind: 242.963796,
    rus: 83.303483,
    usa: 324.994634,
  },
  {
    year: 2002,
    bra: 50.875594,
    can: 36.0469,
    chn: 398.68824,
    fra: 69.700575,
    idn: 61.074973,
    ind: 206.636708,
    rus: 84.730327,
    usa: 297.143452,
  },
  {
    year: 2003,
    bra: 67.454329,
    can: 49.1972,
    chn: 376.655003,
    fra: 55.099557,
    idn: 63.024042,
    ind: 236.5927,
    rus: 65.335462,
    usa: 348.247631,
  },
  {
    year: 2004,
    bra: 63.953364,
    can: 50.7782,
    chn: 413.16379,
    fra: 70.642016,
    idn: 65.313711,
    ind: 229.845504,
    rus: 75.986,
    usa: 389.023763,
  },
  {
    year: 2005,
    bra: 55.670925,
    can: 50.9624,
    chn: 429.370265,
    fra: 64.210067,
    idn: 66.67499,
    ind: 239.997492,
    rus: 76.1921,
    usa: 366.436346,
  },
  {
    year: 2006,
    bra: 59.148978,
    can: 48.5773,
    chn: 452.800282,
    fra: 61.820445,
    idn: 66.064399,
    ind: 242.785588,
    rus: 76.494549,
    usa: 338.3368,
  },
  {
    year: 2007,
    bra: 69.441634,
    can: 48.0053,
    chn: 457.809418,
    fra: 59.578778,
    idn: 70.444963,
    ind: 260.485904,
    rus: 80.207513,
    usa: 415.13086,
  },
  {
    year: 2008,
    bra: 79.745466,
    can: 56.0304,
    chn: 480.12597,
    fra: 70.418032,
    idn: 76.574994,
    ind: 266.8353,
    rus: 106.41789,
    usa: 402.399936,
  },
  {
    year: 2009,
    bra: 70.914791,
    can: 49.6919,
    chn: 483.277147,
    fra: 70.373159,
    idn: 82.028628,
    ind: 250.783392,
    rus: 95.615476,
    usa: 418.666166,
  },
  {
    year: 2010,
    bra: 75.160152,
    can: 46.1222,
    chn: 497.920509,
    fra: 65.839202,
    idn: 84.797028,
    ind: 267.838308,
    rus: 59.619074,
    usa: 401.12633,
  },
  {
    year: 2011,
    bra: 77.586276,
    can: 48.3372,
    chn: 521.171808,
    fra: 63.954886,
    idn: 83.400154,
    ind: 287.86,
    rus: 91.780915,
    usa: 385.545256,
  },
  {
    year: 2012,
    bra: 89.908244,
    can: 51.8399,
    chn: 541.163568,
    fra: 68.341731,
    idn: 88.44315,
    ind: 293.29,
    rus: 68.753479,
    usa: 356.210124,
  },
  {
    year: 2013,
    bra: 100.901726,
    can: 66.528601,
    chn: 554.422547,
    fra: 67.537681,
    idn: 89.791565,
    ind: 294.90951,
    rus: 90.364971,
    usa: 434.30845,
  },
  {
    year: 2014,
    bra: 101.402184,
    can: 51.683501,
    chn: 559.325222,
    fra: 72.579315,
    idn: 89.854891,
    ind: 296.01,
    rus: 103.138503,
    usa: 442.84909,
  },
  {
    year: 2015,
    bra: 106.027826,
    can: 53.563,
    chn: 623.197344,
    fra: 72.875854,
    idn: 95.010276,
    ind: 284.333,
    rus: 102.447609,
    usa: 431.870788,
  },
  {
    year: 2016,
    bra: 84.167849,
    can: 58.904067,
    chn: 618.011522,
    fra: 54.398704,
    idn: 102.93318,
    ind: 297.85,
    rus: 117.755457,
    usa: 503.465267,
  },
  {
    year: 2017,
    bra: 117.979368,
    can: 56.3777,
    chn: 619.879237,
    fra: 68.730244,
    idn: 110.072609,
    ind: 313.64,
    rus: 131.295318,
    usa: 466.847085,
  },
  {
    year: 2018,
    bra: 103.064737,
    can: 58.0958,
    chn: 612.170193,
    fra: 62.740329,
    idn: 113.290938,
    ind: 318.32,
    rus: 109.837875,
    usa: 467.95114,
  },
]
