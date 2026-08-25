/** Widget bundle variants.
 *
 * Most real charts are XY or radial; the network/flow/geo families carry the
 * heavy dependencies (dagre + d3-force for Graph, d3-geo + topojson for maps,
 * d3-sankey…). Two prebuilt bundles split along that line, and the document
 * builder picks per spec — so a bar chart never ships graph-layout engines.
 *
 * `scripts/build-widget.mjs` reads this list (it filters unovis-slim.ts by
 * export name), so adding a component here is the single switch.
 */
export const STANDARD_COMPONENTS: readonly string[] = [
  'XYContainer', 'SingleContainer',
  'Axis', 'Line', 'Area', 'GroupedBar', 'StackedBar', 'Scatter',
  'Timeline', 'Boxplot', 'XYLabels', 'Plotband', 'Plotline',
  'Donut', 'NestedDonut', 'RadialBar',
  'Tooltip', 'Crosshair', 'BulletLegend',
]

export type BundleVariant = 'standard' | 'full'

/** The smallest prebuilt bundle that covers every listed component type */
export function bundleVariantFor (componentTypes: string[]): BundleVariant {
  return componentTypes.every(type => STANDARD_COMPONENTS.includes(type)) ? 'standard' : 'full'
}
