export type EducationDatum = {
  country: string;
  bachelors: number;
  masters: number;
  doctoral: number;
  total?: number;
};

export const labels = {
  bachelors: 'Bachelor\'s or equivalent',
  masters: 'Master\'s or equivalent',
  doctoral: 'Doctoral or equivalent',
}

export const data: EducationDatum[] = [
  {
    country: 'Australia',
    masters: 9.4,
    doctoral: 1.6,
    bachelors: 35,
  },
  {
    country: 'Bahrain',
    masters: 2,
    doctoral: 0.3,
    bachelors: 23.3,
  },
  {
    country: 'Bangladesh',
    masters: 5.7,
    doctoral: 0.2,
    bachelors: 14.1,
  },
  {
    country: 'Bosnia and Herzegovina',
    masters: 1.6,
    doctoral: 0.2,
    bachelors: 10.6,
  },
  {
    country: 'Costa Rica',
    masters: 2.9,
    doctoral: 0.2,
    bachelors: 21.6,
  },
  {
    country: 'Cyprus',
    masters: 13.4,
    doctoral: 1.1,
    bachelors: 29.8,
  },
  {
    country: 'Denmark',
    masters: 13.5,
    doctoral: 1.1,
    bachelors: 33.1,
  },
  {
    country: 'Estonia',
    masters: 21.2,
    doctoral: 0.9,
    bachelors: 30.8,
  },
  {
    country: 'Greece',
    masters: 6.9,
    doctoral: 0.7,
    bachelors: 26,
  },
  {
    country: 'Hungary',
    masters: 11.8,
    doctoral: 0.7,
    bachelors: 24.1,
  },
  {
    country: 'Iceland',
    masters: 16.9,
    doctoral: 1.4,
    bachelors: 36.6,
  },
  {
    country: 'Indonesia',
    masters: 0.6,
    doctoral: 0,
    bachelors: 10.5,
  },
  {
    country: 'Italy',
    masters: 13,
    doctoral: 0.4,
    bachelors: 16.5,
  },
  {
    country: 'Jordan',
    masters: 2.1,
    doctoral: 0.7,
    bachelors: 22.7,
  },
  {
    country: 'Lithuania',
    masters: 14.6,
    doctoral: 0.9,
    bachelors: 38.1,
  },
  {
    country: 'Mali',
    masters: 1,
    doctoral: 0.1,
    bachelors: 1.6,
  },
  {
    country: 'Malta',
    masters: 9.5,
    doctoral: 0.7,
    bachelors: 21.8,
  },
  {
    country: 'Mexico',
    masters: 2.5,
    doctoral: 0.3,
    bachelors: 17.1,
  },
  {
    country: 'Mongolia',
    masters: 3.1,
    doctoral: 0.2,
    bachelors: 32.6,
  },
  {
    country: 'Netherlands',
    masters: 13.1,
    doctoral: 0.7,
    bachelors: 34.8,
  },
  {
    country: 'New Zealand',
    masters: 6.2,
    doctoral: 1.1,
    bachelors: 32.3,
  },
  {
    country: 'North Macedonia',
    masters: 1.9,
    doctoral: 0.3,
    bachelors: 21.7,
  },
  {
    country: 'Oman',
    masters: 1.6,
    doctoral: 0.3,
    bachelors: 17.1,
  },
  {
    country: 'Paraguay',
    masters: 6.6,
    doctoral: 0.1,
    bachelors: 14.2,
  },
  {
    country: 'Poland',
    masters: 21.9,
    doctoral: 0.6,
    bachelors: 28,
  },
  {
    country: 'Portugal',
    masters: 16.2,
    doctoral: 0.8,
    bachelors: 22.5,
  },
  {
    country: 'Saudi Arabia',
    masters: 3.6,
    doctoral: 1.2,
    bachelors: 31.1,
  },
  {
    country: 'Spain',
    masters: 14.2,
    doctoral: 0.9,
    bachelors: 23.6,
  },
  {
    country: 'United Kingdom',
    masters: 13.6,
    doctoral: 1.1,
    bachelors: 37.3,
  },
  {
    country: 'United States',
    masters: 14.1,
    doctoral: 2.1,
    bachelors: 37.5,
  },
  {
    country: 'West Bank and Gaza',
    masters: 1.9,
    doctoral: 0.3,
    bachelors: 21.7,
  },
].map(d => {
  const round = (n: number): number => Math.floor(n * 100) / 100
  return ({
    ...d,
    bachelors: round(d.bachelors - d.masters),
    masters: round(d.masters - d.doctoral),
    total: d.bachelors,
  })
})


