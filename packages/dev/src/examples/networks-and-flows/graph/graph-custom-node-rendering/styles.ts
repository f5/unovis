import { css } from '@emotion/css'

export const exaforceGraph = css`
  label: exaforce-graph;
  --unovis-background-primary: #ffffff;
  --unovis-background-secondary: #fbfbfb;
  --unovis-text-primary: #222;
  --unovis-text-secondary: #666;

  --unovis-graph-node-identity: #F5F3FE;
  --unovis-graph-node-network: #FEF7EE;
  --unovis-graph-node-resource: #EFF2FE;
  --unovis-graph-node-compute: #F0F6FE;
  --unovis-graph-node-secret: #F2FDFA;
  --unovis-graph-node-finding: #FDF1F2;
  --unovis-graph-node-threat-actor: #AE2A3F;

  --unovis-graph-font: "Noto Sans Mono", monospace;
  --unovis-graph-circle-label-font-size: 8px;
  --unovis-graph-circle-label-font-weight: 600;
  --unovis-graph-circle-label-fill: #fff;
  --unovis-graph-circle-label-background-fill: #52525A;
  --unovis-graph-circle-label-background-stroke: #fff;
  --unovis-graph-enrichment-background-fill: #fff;

  --unovis-graph-node-label-font-size: 9px;
  --unovis-graph-node-label-color: var(--unovis-text-primary);
  --unovis-graph-node-sublabel-font-size: 8px;
  --unovis-graph-node-sublabel-color: var(--unovis-text-secondary);
  --unovis-graph-swimlane-label-font-size: 9pt;
  --unovis-graph-swimlane-label-text-color: var(--unovis-text-secondary);

  --unovis-severity-critical: #ae2a3f;
  --unovis-severity-high: #e14f62;
  --unovis-severity-medium: #d9622b;
  --unovis-severity-low: #e2b53e;

  [clickable="true"] {
    cursor: pointer;
  }
`

// Node Appearance
export const node = css`label: node-group;`
export const nodeCircle = css`label: node-background;`
export const nodeIcon = css`label: node-icon; pointer-events: none;`
export const nodeSelectionBackground = css`
  label: node-selection-background;
  fill: none;
  stroke: var(--unovis-text-secondary);
  stroke-dasharray: 4 4;
`
export const nodeHighlightBackground = css`label: node-highlight-background;`

// Node Aggregation
export const nodeAggregationBackground = css`label: node-aggregation-background;`
export const nodeAggregationText = css`label: node-aggregation-text;`

// Watchlist
export const nodeWatchlistBackground = css`label: node-watchlist-background;`
export const nodeWatchlistIcon = css`label: node-watchlist-icon;`

// Session Count
export const nodeSessionCountBackground = css`label: node-session-count-background;`
export const nodeSessionCountText = css`label: node-session-count-text;`

// Findings
export const nodeFinding = css`label: node-finding;`
export const nodeFindingBackground = css`label: node-finding-background;`
export const nodeFindingText = css`label: node-finding-text;`

// Enrichment
export const nodeEnrichments = css`label: node-enrichments;`
export const nodeEnrichment = css`label: node-enrichment;`
export const nodeEnrichmentBackground = css`
  label: node-enrichment-background;
  fill: var(--unovis-graph-enrichment-background-fill);
`
export const nodeEnrichmentIcon = css`label: node-enrichment-icon;`

// Node Labels
export const nodeLabel = css`
  label: node-label;
  text-anchor: middle;
  font-size: var(--unovis-graph-node-label-font-size);
  fill: var(--unovis-graph-node-label-color);
`
export const nodeSubLabel = css`
  label: node-sub-label;
  text-anchor: middle;
  font-size: var(--unovis-graph-node-sublabel-font-size);
  fill: var(--unovis-graph-node-sublabel-color);
`

// Shared Circle Label Styles
export const nodeCircleLabelBackground = css`
  label: node-circle-label-background;
  fill: var(--unovis-graph-circle-label-background-fill);
  stroke: var(--unovis-graph-circle-label-background-stroke);
  stroke-width: 2;
`

export const nodeCircleLabelText = css`
  label: node-circle-label-text;
  font-family: var(--unovis-graph-font);
  font-size: var(--unovis-graph-circle-label-font-size);
  font-weight: var(--unovis-graph-circle-label-font-weight);
  fill: var(--unovis-graph-circle-label-fill);
  text-anchor: middle;
`

// Swimlanes
export const swimlaneRect = css`label: swimlane-rect;`
export const swimlaneLabel = css`label: swimlane-label;`
export const swimlaneLabelBackground = css`label: swimlane-label-background;`
export const swimlaneLabelText = css`
  label: swimlane-label-text;
  font-size: var(--unovis-graph-swimlane-label-font-size);
  font-weight: var(--unovis-graph-swimlane-label-font-weight);
  fill: var(--unovis-graph-swimlane-label-text-color);
  text-anchor: middle;
`
// Checkbox
export const checkboxContainer = css`
  label: checkbox-container;
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

export const graphButton = css`
  label: graph-button;
  display: block;
  margin-top: 5px;
`
