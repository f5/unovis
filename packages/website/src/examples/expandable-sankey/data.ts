export type NodeDatum = {
  id: string;
  label: string;
  subgroups: string[];
  value: number;
  expandable?: boolean;
  expanded?: boolean;
  level?: number;
};

export type LinkDatum = {
  source: string;
  target: string;
  value: number;
};

export type SankeyData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
};

export function getColor (n: NodeDatum): string | undefined {
  const colorMap = Object.fromEntries([
    ['1', '#1acb9a'],
    ['3', '#6A9DFF'],
    ['4', '#8ee422'],
    ['5', '#a611a5'],
    ['6', '#f88080'],
  ])
  return colorMap[n.id.charAt(0)]
}

const expenditureData = [
  {
    id: '',
    label: 'Average Weekly Expenditure',
    value: 414.6,
    color: '#d4d4d4',
    subgroups: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    id: '1',
    label: 'Consumables',
    value: 83.3,
    subgroups: ['1A', '1B', '1C'],
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
    subgroups: ['1Ba', '1Bb'],
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
  {
    id: '2',
    label: 'Apparel',
    value: 14.5,
    subgroups: [],
  },
  {
    id: '3',
    label: 'Household expenses',
    value: 131.4,
    subgroups: ['3A', '3B', '3C', '3D', '3E'],
  },
  {
    id: '3A',
    label: 'Rent',
    value: 51.2,
    subgroups: [],
  },
  {
    id: '3B',
    label: 'Utilities',
    value: 34.3,
    subgroups: ['3B1', '3B2', '3B3'],
  },
  {
    id: '3B1',
    label: 'Water',
    value: 9.9,
    subgroups: [],
  },
  {
    id: '3B2',
    label: 'Power',
    value: 23.2,
    subgroups: [],
  },
  {
    id: '3B3',
    label: 'Other',
    value: 1.2,
    subgroups: [],
  },
  {
    id: '3C',
    label: 'Goods & Furninshings',
    value: 15.0,
    subgroups: [],
  },
  {
    id: '3D',
    label: 'Repair',
    value: 10,
    subgroups: [],
  },
  {
    id: '3E',
    label: 'Phone/Internet',
    value: 20.9,
    subgroups: [],
  },
  {
    id: '4',
    label: 'Transport',
    value: 60.8,
    subgroups: ['4A', '4B'],
  },
  {
    id: '4A',
    label: 'Personal transport',
    value: 51.2,
    subgroups: [],
  },
  {
    id: '4B',
    label: 'Public transport',
    value: 9.6,
    subgroups: [],
  },
  {
    id: '5',
    label: 'Individual expenses',
    value: 37.0,
    subgroups: ['5A', '5B', '5C'],
  },
  {
    id: '5A',
    label: 'Insurance',
    value: 20.4,
    subgroups: [],
  },
  {
    id: '5B',
    label: 'Healthcare',
    value: 6.7,
    subgroups: [],
  },
  {
    id: '5C',
    label: 'Personal care',
    value: 9.9,
    subgroups: [],
  },
  {
    id: '6',
    label: 'Recreation & Culture',
    value: 45.5,
    subgroups: ['6A', '6B', '6C', '6D', '6E'],
  },
  {
    id: '6A',
    label: 'Electronics',
    value: 5.0,
    subgroups: [],
  },
  {
    id: '6B',
    label: 'Events & Activities',
    value: 11.3,
    subgroups: [],
  },
  {
    id: '6C',
    label: 'Pets',
    value: 6.7,
    subgroups: [],
  },
  {
    id: '6D',
    label: 'Hobbies',
    value: 16.3,
    subgroups: [],
  },
  {
    id: '6E',
    label: 'Other',
    value: 6.2,
    subgroups: [],
  },
  {
    id: '7',
    label: 'Education',
    value: 8.3,
    subgroups: [],
  },
  {
    id: '8',
    label: 'Restaurant & Hotels',
    value: 18.8,
    subgroups: [],
  },
  {
    id: '9',
    label: 'Miscellaneous',
    value: 15.0,
    subgroups: [],
  },
]

const getNode = (id: string): NodeDatum => expenditureData.find((d) => d.id === id)

export const sankeyData: SankeyData = {
  nodes: expenditureData.map(d => ({
    ...d,
    level: d.id.length,
    expandable: d.subgroups.length !== 0,
    expanded: false,
  })),
  links: expenditureData.flatMap((d) =>
    d.subgroups.map((id) => ({
      source: d.id,
      target: id,
      value: getNode(id).value,
    }))
  ),
}

export const sourceNode = {
  ...sankeyData.nodes[0],
  expandable: false,
}

export function getChildren (n: NodeDatum): NodeDatum[] {
  return sankeyData.nodes.filter(d => n.subgroups?.includes(d.id))
}
