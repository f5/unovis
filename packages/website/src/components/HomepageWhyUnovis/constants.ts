export type Fact = {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export const HOMEPAGE_FACTS: Fact[] = [
  {
    title: 'Looks finished by default',
    description: 'A palette tuned for light and dark backgrounds, smooth curves, rounded bars and uncluttered axes, before you configure anything.',
    link: '/why-unovis/line-chart',
    linkText: 'See it next to the others',
  },
  {
    title: 'Interactions that feel right',
    description: 'The crosshair snaps to your data, tooltips are plain HTML you control, brushes select ranges, and graphs and maps zoom and pan.',
    link: '/why-unovis/brush',
    linkText: 'Try the brush',
  },
  {
    title: 'Styled with CSS, dark mode included',
    description: 'Every color, stroke and font is a CSS variable, and charts switch to dark mode when your page does.',
    link: '/docs/guides/theming',
    linkText: 'Theming guide',
  },
  {
    title: 'Text that fits',
    description: 'Axis labels wrap or trim to the space available, and overlapping labels are hidden or clustered, so long names stay readable.',
    link: '/why-unovis/grouped-bar-chart',
    linkText: 'Compare long labels',
  },
  {
    title: 'Beyond the basic charts',
    description: 'Network graphs with force, Dagre and ELK layouts, Sankey and chord diagrams, maps, timelines and treemaps, with the same API and look.',
    link: '/gallery',
    linkText: 'Gallery',
  },
  {
    title: 'Ready for AI agents',
    description: 'Options and their defaults are documented in the types, and the MCP server renders charts to SVG or PNG so an agent can see what it made.',
    link: '/docs/mcp',
    linkText: 'MCP server',
  },
]
