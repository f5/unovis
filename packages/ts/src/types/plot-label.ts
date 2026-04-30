/**
 * Strategy for a Plotline / Plotband label when its preferred anchor would
 * collide with another label.
 */
export enum LabelOverflow {
  /** Try alternate anchors and pick the lowest-overlap fit (default). */
  Smart = 'smart',
  /** Hide the label (`opacity: 0`, DOM kept) instead of moving it. */
  Hide = 'hide',
  /** Stay at the preferred anchor regardless of collisions. */
  Stack = 'stack',
}

export type PlotLabelLayout = {
  x: number;
  y: number;
  transform: string;
  textAnchor: string;
  dominantBaseline: string;
}

/**
 * Surface that `XYContainer` reads from `Plotline` and `Plotband` to coordinate
 * auto label positioning across siblings. Each component implements
 * `getLabelLayoutInfo()` to expose this info and a `computeLayout(anchor)`
 * function that recomputes its own label position for an alternative anchor.
 */
export interface PlotLabelLayoutInfo {
  /** The DOM `<text>` element being laid out. `null` when not yet rendered. */
  labelEl: SVGTextElement | null;
  /** Preferred anchor identifier (component-specific enum value). */
  preferredAnchor: string;
  /** Ordered candidate anchors, preferred first, closest-to-preferred next. */
  candidates: string[];
  /** True when this label opted into auto-positioning AND has visible label text. */
  participatesInAuto: boolean;
  /** Strategy when no candidate passes bounds + collision. */
  overflow: LabelOverflow;
  /** Recompute layout for a given anchor. Pure — does not mutate the DOM. */
  computeLayout: (anchor: string) => PlotLabelLayout;
}
