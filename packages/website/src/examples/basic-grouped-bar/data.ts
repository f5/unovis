export type ElectionDatum = {
  year: number;
  democrat: number;
  republican: number;
  other: number;
  libertarian: number;
}

export const colors = {
  republican: '#f45a6d',
  democrat: '#2780eb',
  other: '#ffc180',
  libertarian: '#34daa6',
}

export const data: ElectionDatum[] = [
  {
    year: 1980,
    republican: 43642639,
    democrat: 35480948,
    other: 6505863,
    libertarian: 867401,
  },
  {
    year: 1984,
    republican: 54166829,
    democrat: 37449813,
    libertarian: 227204,
    other: 811015,
  },
  {
    year: 1988,
    republican: 48642640,
    democrat: 41716679,
    libertarian: 409708,
    other: 817798,
  },
  {
    year: 1992,
    republican: 38798913,
    democrat: 44856747,
    other: 20663272,
    libertarian: 280848,
  },
  {
    year: 1996,
    republican: 39003697,
    democrat: 47295351,
    other: 9625419,
    libertarian: 465351,
  },
  {
    year: 2000,
    republican: 50311372,
    democrat: 50830580,
    other: 4071625,
    libertarian: 380405,
  },
  {
    year: 2004,
    republican: 61872711,
    democrat: 58894561,
    other: 1212870,
    libertarian: 369308,
  },
  {
    year: 2008,
    republican: 59613835,
    democrat: 69338846,
    other: 1956116,
    libertarian: 510456,
  },
  {
    year: 2012,
    republican: 60670117,
    democrat: 65752017,
    other: 1501463,
    libertarian: 1216400,
  },
  {
    year: 2016,
    republican: 62692670,
    democrat: 65677288,
    libertarian: 4125170,
    other: 4292059,
  },
  {
    year: 2020,
    democrat: 81268908,
    republican: 74216146,
    libertarian: 1797355,
    other: 1246094,
  },
]
