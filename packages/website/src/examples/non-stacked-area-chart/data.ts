import { BulletLegendItemInterface } from '@unovis/ts'

export enum Country {
  UnitedStates = 'us',
  India = 'in',
}

export const countries: Record<Country, BulletLegendItemInterface> = {
  [Country.UnitedStates]: { name: 'United States', color: '#192f7e' },
  [Country.India]: { name: 'India', color: '#D9C6BB' },
}

export type DataRecord = {
  monthYear: string;
  cases: Record<Country, number>;
}
export const data = [
  {
    month: 'Jan ',
    year: '2020',
    cases: {
      us: 17,
      in: 2,
    },
  },
  {
    month: 'Feb ',
    year: '2020',
    cases: {
      us: 192054,
      in: 1394,
    },
  },
  {
    month: 'Mar ',
    year: '2020',
    cases: {
      us: 888960,
      in: 33466,
    },
  },
  {
    month: 'Apr ',
    year: '2020',
    cases: {
      us: 709914,
      in: 155746,
    },
  },
  {
    month: 'May ',
    year: '2020',
    cases: {
      us: 857953,
      in: 394872,
    },
  },
  {
    month: 'Jun ',
    year: '2020',
    cases: {
      us: 1900714,
      in: 1110507,
    },
  },
  {
    month: 'Jul ',
    year: '2020',
    cases: {
      us: 1498157,
      in: 1995178,
    },
  },
  {
    month: 'Aug ',
    year: '2020',
    cases: {
      us: 1199938,
      in: 2621418,
    },
  },
  {
    month: 'Sep ',
    year: '2020',
    cases: {
      us: 1929404,
      in: 1871498,
    },
  },
  {
    month: 'Oct ',
    year: '2020',
    cases: {
      us: 4491966,
      in: 1278727,
    },
  },
  {
    month: 'Nov ',
    year: '2020',
    cases: {
      us: 6552554,
      in: 823900,
    },
  },
  {
    month: 'Dec ',
    year: '2021',
    cases: {
      us: 6137647,
      in: 470901,
    },
  },
  {
    month: 'Jan ',
    year: '2021',
    cases: {
      us: 2407641,
      in: 354631,
    },
  },
  {
    month: 'Feb ',
    year: '2021',
    cases: {
      us: 1815452,
      in: 1109424,
    },
  },
  {
    month: 'Mar ',
    year: '2021',
    cases: {
      us: 1888568,
      in: 6943304,
    },
  },
  {
    month: 'Apr ',
    year: '2021',
    cases: {
      us: 918464,
      in: 9010075,
    },
  },
  {
    month: 'May ',
    year: '2021',
    cases: {
      us: 395964,
      in: 2236590,
    },
  },
  {
    month: 'Jun ',
    year: '2021',
    cases: {
      us: 1325058,
      in: 1244190,
    },
  },
  {
    month: 'Jul ',
    year: '2021',
    cases: {
      us: 4288230,
      in: 1155021,
    },
  },
  {
    month: 'Aug ',
    year: '2021',
    cases: {
      us: 4145216,
      in: 955862,
    },
  },
  {
    month: 'Sep ',
    year: '2021',
    cases: {
      us: 2514028,
      in: 519107,
    },
  },
  {
    month: 'Oct ',
    year: '2021',
    cases: {
      us: 2552781,
      in: 310962,
    },
  },
  {
    month: 'Nov ',
    year: '2021',
    cases: {
      us: 6301559,
      in: 264803,
    },
  },
  {
    month: 'Dec ',
    year: '2022',
    cases: {
      us: 20356226,
      in: 6607920,
    },
  },
  {
    month: 'Jan ',
    year: '2022',
    cases: {
      us: 3939161,
      in: 1461546,
    },
  },
  {
    month: 'Feb ',
    year: '2022',
    cases: {
      us: 1040859,
      in: 94730,
    },
  },
  {
    month: 'Mar ',
    year: '2022',
    cases: {
      us: 1244769,
      in: 53413,
    },
  },
  {
    month: 'Apr ',
    year: '2022',
    cases: {
      us: 2861199,
      in: 81644,
    },
  },
  {
    month: 'May ',
    year: '2022',
    cases: {
      us: 3347582,
      in: 308402,
    },
  },
  {
    month: 'Jun ',
    year: '2022',
    cases: {
      us: 3669595,
      in: 567041,
    },
  },
  {
    month: 'Jul ',
    year: '2022',
    cases: {
      us: 3183964,
      in: 400064,
    },
  },
  {
    month: 'Aug ',
    year: '2022',
    cases: {
      us: 1560602,
      in: 139134,
    },
  },
]
