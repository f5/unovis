export type DataRecord = {
  version: string;
  status: string;
  start: number;
  end: number;
  scheduled: boolean;
  releaseManager: string;
  schedule: string;
}

export const data: DataRecord[] = [
  {
    version: '3.15',
    status: 'bugfix',
    start: 1791504000000,
    end: 1948579200000,
    scheduled: true,
    releaseManager: 'Hugo van Kemenade',
    schedule: 'https://peps.python.org/pep-0790/',
  },
  {
    version: '3.14',
    status: 'bugfix',
    start: 1759795200000,
    end: 1917043200000,
    scheduled: true,
    releaseManager: 'Hugo van Kemenade',
    schedule: 'https://peps.python.org/pep-0745/',
  },
  {
    version: '3.13',
    status: 'security',
    start: 1728259200000,
    end: 1885507200000,
    scheduled: true,
    releaseManager: 'Thomas Wouters',
    schedule: 'https://peps.python.org/pep-0719/',
  },
  {
    version: '3.12',
    status: 'security',
    start: 1696204800000,
    end: 1853971200000,
    scheduled: true,
    releaseManager: 'Thomas Wouters',
    schedule: 'https://peps.python.org/pep-0693/',
  },
  {
    version: '3.11',
    status: 'security',
    start: 1666569600000,
    end: 1822348800000,
    scheduled: true,
    releaseManager: 'Pablo Galindo Salgado',
    schedule: 'https://peps.python.org/pep-0664/',
  },
  {
    version: '3.10',
    status: 'end-of-life',
    start: 1633305600000,
    end: 1790812800000,
    scheduled: false,
    releaseManager: 'Pablo Galindo Salgado',
    schedule: 'https://peps.python.org/pep-0619/',
  },
  {
    version: '3.9',
    status: 'end-of-life',
    start: 1601856000000,
    end: 1761868800000,
    scheduled: false,
    releaseManager: 'Łukasz Langa',
    schedule: 'https://peps.python.org/pep-0596/',
  },
  {
    version: '3.8',
    status: 'end-of-life',
    start: 1571011200000,
    end: 1728259200000,
    scheduled: false,
    releaseManager: 'Łukasz Langa',
    schedule: 'https://peps.python.org/pep-0569/',
  },
  {
    version: '3.7',
    status: 'end-of-life',
    start: 1530057600000,
    end: 1687824000000,
    scheduled: false,
    releaseManager: 'Ned Deily',
    schedule: 'https://peps.python.org/pep-0537/',
  },
]
