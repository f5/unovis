/** Height of the chart area in every comparison card, in pixels */
export const COMPARISON_CHART_HEIGHT = 320

/** Height of the chart area for networks, flows and maps, which need more room */
export const COMPARISON_TALL_CHART_HEIGHT = 440

/** Height of the chart area for the network graph, whose multi-line labels need even more room */
export const COMPARISON_GRAPH_CHART_HEIGHT = 560

/** Seed used to generate the initial data set so every page load starts with the same charts */
export const COMPARISON_INITIAL_SEED = 2025

/** The Unovis tooltips on the comparison pages keep 10px between the pointer and their edge, and get a class for their
 * styling (see LibraryComparison/styles.module.css) since they're attached to <body> */
export const COMPARISON_TOOLTIP_PROPS = { horizontalShift: 10, className: 'comparisonTooltip' }

/** Approximate distance between the x axis ticks of the Unovis charts, in pixels, so a card gets a tick per month
 * where the library default would show only a few */
export const COMPARISON_AXIS_TICK_SPACING = 120
