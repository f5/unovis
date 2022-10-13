/* eslint-disable @typescript-eslint/naming-convention */
type Mention = {
  positive: number;
  negative: number;
  neutral: number;
}
export type DataRecord = Record<string, Mention> & {
  year: number;
}

export const candidates = ['Hillary Clinton', 'Donald Trump'].map(c => ({
  name: c,
  color: 'var(--vis-color-gray)',
}))

export const data = [
  {
    year: 2007,
    'Jeb Bush': {
      positive: 0,
      negative: 1,
      neutral: 0,
    },
    'Hillary Clinton': {
      positive: 3,
      negative: 0,
      neutral: 1,
    },
    'Donald Trump': {
      positive: 3,
      negative: 0,
      neutral: 4,
    },
    Total: {
      positive: 6,
      negative: 1,
    },
  },
  {
    year: 2008,
    'Hillary Clinton': {
      positive: 0,
      negative: 10,
      neutral: 7,
    },
    'Donald Trump': {
      positive: 6,
      negative: 0,
      neutral: 3,
    },
    Total: {
      positive: 6,
      negative: 10,
    },
  },
  {
    year: 2009,
    'Hillary Clinton': {
      positive: 1,
      negative: 1,
      neutral: 3,
    },
    'Donald Trump': {
      positive: 4,
      negative: 1,
      neutral: 2,
    },
    Total: {
      positive: 5,
      negative: 2,
    },
  },
  {
    year: 2010,
    'Hillary Clinton': {
      positive: 3,
      negative: 1,
      neutral: 1,
    },
    'Donald Trump': {
      positive: 7,
      negative: 0,
      neutral: 5,
    },
    Total: {
      positive: 10,
      negative: 1,
    },
  },
  {
    year: 2011,
    'Mike Huckabee': {
      positive: 0,
      negative: 0,
      neutral: 1,
    },
    'Ben Carson': {
      positive: 1,
      negative: 0,
      neutral: 0,
    },
    'Hillary Clinton': {
      positive: 1,
      negative: 1,
      neutral: 2,
    },
    'Donald Trump': {
      positive: 8,
      negative: 1,
      neutral: 7,
    },
    Total: {
      positive: 10,
      negative: 2,
    },
  },
  {
    year: 2012,
    'Mike Huckabee': {
      positive: 0,
      negative: 1,
      neutral: 0,
    },
    'Jeb Bush': {
      positive: 0,
      negative: 1,
      neutral: 0,
    },
    'Hillary Clinton': {
      positive: 1,
      negative: 3,
      neutral: 7,
    },
    'Donald Trump': {
      positive: 14,
      negative: 0,
      neutral: 3,
    },
    Total: {
      positive: 15,
      negative: 5,
    },
  },
  {
    year: 2013,
    'Jeb Bush': {
      positive: 0,
      negative: 1,
      neutral: 0,
    },
    'Hillary Clinton': {
      positive: 0,
      negative: 2,
      neutral: 6,
    },
    'Donald Trump': {
      positive: 19,
      negative: 2,
      neutral: 12,
    },
    Total: {
      positive: 19,
      negative: 5,
    },
  },
  {
    year: 2014,
    'Chris Christie': {
      positive: 0,
      negative: 0,
      neutral: 1,
    },
    'Hillary Clinton': {
      positive: 2,
      negative: 0,
      neutral: 2,
    },
    'Donald Trump': {
      positive: 16,
      negative: 1,
      neutral: 5,
    },
    Total: {
      positive: 18,
      negative: 1,
    },
  },
  {
    year: 2015,
    'Ted Cruz': {
      positive: 0,
      negative: 1,
      neutral: 0,
    },
    'Hillary Clinton': {
      positive: 3,
      negative: 1,
      neutral: 2,
    },
    'Bernie Sanders': {
      positive: 1,
      negative: 1,
      neutral: 0,
    },
    'Donald Trump': {
      positive: 12,
      negative: 11,
      neutral: 9,
    },
    Total: {
      positive: 16,
      negative: 14,
    },
  },
  {
    year: 2016,
    'Chris Christie': {
      positive: 0,
      negative: 0,
      neutral: 1,
    },
    'Hillary Clinton': {
      positive: 1,
      negative: 0,
      neutral: 2,
    },
    'Donald Trump': {
      positive: 4,
      negative: 15,
      neutral: 8,
    },
    Total: {
      positive: 5,
      negative: 15,
    },
  },
]
