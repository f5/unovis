export type Node = {
  id: string;
  label: string;
  value: number;
  subgroups: Node[];
  color?: string;
  expandable?: boolean;
  expanded?: boolean;
}
export type Link = { source: string; target: string; value: number }

export type Sankey = {
  readonly nodes: Node[];
  readonly links: Link[];
  collapse: (n: Node) => void;
  expand: (n: Node) => void;
}

const categories = [
  {
    label: 'Consumables',
    color: '#1acb9a',
    value: 83.3,
    subgroups: [
      { label: 'Food', value: 63.3 },
      {
        label: 'Drinks',
        value: 17.2,
        subgroups: [
          { label: 'Non-alcoholic', value: 5.9 },
          { label: 'Alcoholic', value: 11.3 },
        ],
      },
      { label: 'Tobacco/narcotics', value: 2.8 },
    ],
  },
  { label: 'Apparel', value: 14.5 },
  {
    label: 'Household expenses',
    color: '#6A9DFF',
    value: 131.4,
    subgroups: [
      { label: 'Rent', value: 51.2 },
      {
        label: 'Utilities',
        value: 34.3,
        subgroups: [
          { label: 'Water', value: 9.9 },
          { label: 'Power', value: 23.2 },
          { label: 'Other', value: 1.2 },
        ],
      },
      { label: 'Goods & Furninshings', value: 15.0 },
      { label: 'Repair', value: 10 },
      { label: 'Phone/Internet', value: 20.9 },
    ],
  },
  {
    label: 'Transport',
    color: '#8ee422',
    value: 60.8,
    subgroups: [
      { label: 'Personal transport', value: 51.2 },
      { label: 'Public transport', value: 9.6 },
    ],
  },
  {
    label: 'Individual expenses',
    color: '#a611a5',
    value: 37.0,
    subgroups: [
      { label: 'Insurance', value: 20.4 },
      { label: 'Healthcare', value: 6.7 },
      { label: 'Personal care', value: 9.9 },
    ],
  },
  {
    label: 'Recreation & Culture',
    color: '#f88080',
    value: 45.5,
    subgroups: [
      { label: 'Electronics', value: 5.0 },
      { label: 'Events & Activities', value: 11.3 },
      { label: 'Pets', value: 6.7 },
      { label: 'Hobbies', value: 16.3 },
      { label: 'Other', value: 6.2 },
    ],
  },
  { label: 'Education', value: 8.3 },
  { label: 'Restaurant & Hotels', value: 18.8 },
  { label: 'Miscellaneous', value: 15.0 },
]


const getNodes = (n: Node): Node[] => n.subgroups?.map((child, i) => ({
  ...child,
  id: [n.id, i].join(''),
  color: child.color ?? n.color,
  expanded: false,
  expandable: child.subgroups?.length > 0,
}))

const getLinks = (n: Node): Link[] => n.subgroups.map(target => ({
  source: n.id,
  target: target.id,
  value: target.value,
}))

const generate = (n: Node): Node => ({ ...n, subgroups: getNodes(n) })

export const root: Node = generate({
  id: 'root',
  label: 'Average Weekly Expenditure',
  value: 414.7,
  expanded: true,
  expandable: true,
  subgroups: categories as Node[],
})

export const sankeyData: Sankey = {
  nodes: [root, ...root.subgroups],
  links: getLinks(root),
  expand: function (n: Node): void {
    n.subgroups = getNodes(n)
    this.nodes = this.nodes.concat(n.subgroups)
    this.links = this.links.concat(getLinks(n))
  },
  collapse: function (n: Node): void {
    this.nodes = this.nodes.filter(d => d.id === n.id || !d.id.startsWith(n.id))
    this.links = this.links.filter(d => !d.source.id.startsWith(n.id))
  },
}
