/* eslint-disable @typescript-eslint/naming-convention */
type Mention = {
  neutral: number;
  negative: number;
  positive: number;
}
export type DataRecord = Record<string, Mention> & {
  year: number;
}

export const candidates = ['Hillary Clinton', 'Donald Trump'].map(c => ({
  name: c,
  color: 'var(--vis-color-grey)',
}))

export const data = [
  {
    year: 2007,
    'Jeb Bush': {
      neutral: 0,
      negative: 1,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 1,
      negative: 0,
      positive: 3,
    },
    'Donald Trump': {
      neutral: 4,
      negative: 0,
      positive: 3,
    },
    Total: {
      negative: 1,
      positive: 6,
    },
  },
  {
    year: 2008,
    'Hillary Clinton': {
      neutral: 7,
      negative: 10,
      positive: 0,
    },
    'Donald Trump': {
      neutral: 3,
      negative: 0,
      positive: 6,
    },
    Total: {
      negative: 10,
      positive: 6,
    },
  },
  {
    year: 2009,
    'Hillary Clinton': {
      neutral: 3,
      negative: 1,
      positive: 1,
    },
    'Donald Trump': {
      neutral: 2,
      negative: 1,
      positive: 4,
    },
    Total: {
      negative: 2,
      positive: 5,
    },
  },
  {
    year: 2010,
    'Hillary Clinton': {
      neutral: 1,
      negative: 1,
      positive: 3,
    },
    'Donald Trump': {
      neutral: 5,
      negative: 0,
      positive: 7,
    },
    Total: {
      negative: 1,
      positive: 10,
    },
  },
  {
    year: 2011,
    'Mike Huckabee': {
      neutral: 1,
      negative: 0,
      positive: 0,
    },
    'Ben Carson': {
      neutral: 0,
      negative: 0,
      positive: 1,
    },
    'Hillary Clinton': {
      neutral: 2,
      negative: 1,
      positive: 1,
    },
    'Donald Trump': {
      neutral: 7,
      negative: 1,
      positive: 8,
    },
    Total: {
      negative: 2,
      positive: 10,
    },
  },
  {
    year: 2012,
    'Mike Huckabee': {
      neutral: 0,
      negative: 1,
      positive: 0,
    },
    'Jeb Bush': {
      neutral: 0,
      negative: 1,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 7,
      negative: 3,
      positive: 1,
    },
    'Donald Trump': {
      neutral: 3,
      negative: 0,
      positive: 14,
    },
    Total: {
      negative: 5,
      positive: 15,
    },
  },
  {
    year: 2013,
    'Jeb Bush': {
      neutral: 0,
      negative: 1,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 6,
      negative: 2,
      positive: 0,
    },
    'Donald Trump': {
      neutral: 12,
      negative: 2,
      positive: 19,
    },
    Total: {
      negative: 5,
      positive: 19,
    },
  },
  {
    year: 2014,
    'Chris Christie': {
      neutral: 1,
      negative: 0,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 2,
      negative: 0,
      positive: 2,
    },
    'Donald Trump': {
      neutral: 5,
      negative: 1,
      positive: 16,
    },
    Total: {
      negative: 1,
      positive: 18,
    },
  },
  {
    year: 2015,
    'Ted Cruz': {
      neutral: 0,
      negative: 1,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 2,
      negative: 1,
      positive: 3,
    },
    'Bernie Sanders': {
      neutral: 0,
      negative: 1,
      positive: 1,
    },
    'Donald Trump': {
      neutral: 9,
      negative: 11,
      positive: 12,
    },
    Total: {
      negative: 14,
      positive: 16,
    },
  },
  {
    year: 2016,
    'Chris Christie': {
      neutral: 1,
      negative: 0,
      positive: 0,
    },
    'Hillary Clinton': {
      neutral: 2,
      negative: 0,
      positive: 1,
    },
    'Donald Trump': {
      neutral: 8,
      negative: 15,
      positive: 4,
    },
    Total: {
      negative: 15,
      positive: 5,
    },
  },
]
