export type NodeDatum = {
  id: string;
  label: string;
  subgroups: string[];
  value: number;
}

export type LinkDatum = {
  source: string;
  target: string;
  value: number;
}

type SankeyData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export const data: SankeyData = {
  nodes: [
    {
      id: '1',
      label: 'Consumables',
      value: 83.3,
      subgroups: [
        '1A',
        '1B',
        '1C',
      ],
    },
    {
      id: '1A',
      label: 'Food',
      value: 63.3,
      subgroups: [],
    },
    {
      id: '1B',
      label: 'Drinks',
      value: 17.2,
      subgroups: [
        '1Ba',
        '1Bb',
      ],
    },
    {
      id: '1Ba',
      label: 'Non-alcoholic',
      value: 5.9,
      subgroups: [],
    },
    {
      id: '1Bb',
      label: 'Alcoholic',
      value: 11.3,
      subgroups: [],
    },
    {
      id: '1C',
      label: 'Tobacco/narcotics',
      value: 2.8,
      subgroups: [],
    },
  ],
  links: [
    {
      source: '',
      target: '1',
      value: 83.3,
    },
    {
      source: '',
      target: '2',
      value: 14.5,
    },
    {
      source: '',
      target: '3',
      value: 131.4,
    },
    {
      source: '',
      target: '4',
      value: 60.8,
    },
    {
      source: '',
      target: '5',
      value: 37,
    },
    {
      source: '',
      target: '6',
      value: 45.5,
    },
    {
      source: '',
      target: '7',
      value: 8.3,
    },
    {
      source: '',
      target: '8',
      value: 18.8,
    },
    {
      source: '',
      target: '9',
      value: 15,
    },
    {
      source: '1',
      target: '1A',
      value: 63.3,
    },
    {
      source: '1',
      target: '1B',
      value: 17.2,
    },
    {
      source: '1',
      target: '1C',
      value: 2.8,
    },
    {
      source: '1B',
      target: '1Ba',
      value: 5.9,
    },
    {
      source: '1B',
      target: '1Bb',
      value: 11.3,
    },
    {
      source: '3',
      target: '3A',
      value: 51.2,
    },
    {
      source: '3',
      target: '3B',
      value: 34.3,
    },
    {
      source: '3',
      target: '3C',
      value: 15,
    },
    {
      source: '3',
      target: '3D',
      value: 10,
    },
    {
      source: '3',
      target: '3E',
      value: 20.9,
    },
    {
      source: '3B',
      target: '3B1',
      value: 9.9,
    },
    {
      source: '3B',
      target: '3B2',
      value: 23.2,
    },
    {
      source: '3B',
      target: '3B3',
      value: 1.2,
    },
    {
      source: '4',
      target: '4A',
      value: 51.2,
    },
    {
      source: '4',
      target: '4B',
      value: 9.6,
    },
    {
      source: '5',
      target: '5A',
      value: 20.4,
    },
    {
      source: '5',
      target: '5B',
      value: 6.7,
    },
    {
      source: '5',
      target: '5C',
      value: 9.9,
    },
    {
      source: '6',
      target: '6A',
      value: 5,
    },
    {
      source: '6',
      target: '6B',
      value: 11.3,
    },
    {
      source: '6',
      target: '6C',
      value: 6.7,
    },
    {
      source: '6',
      target: '6D',
      value: 16.3,
    },
    {
      source: '6',
      target: '6E',
      value: 6.2,
    },
  ],
}
