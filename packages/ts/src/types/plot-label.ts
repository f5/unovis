import { TextAlign, VerticalAlign } from '@/types/text'

/**
 * Strategy for a Plotline / Plotband label when its preferred anchor would
 * collide with another label.
 */
export enum LabelOverflow {
  /** Hide the label (`opacity: 0`, DOM kept) when it would collide. */
  Hide = 'hide',
  /** Stay at the preferred anchor regardless of collisions (default). */
  Stack = 'stack',
}

export type PlotLabelLayout = {
  x: number;
  y: number;
  rotation: number;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
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
  /** True when this label opted into auto-positioning AND has visible label text. */
  participatesInAuto: boolean;
  /** Strategy when the preferred anchor collides with another label. */
  overflow: LabelOverflow;
  /** Recompute layout for a given anchor. Pure — does not mutate the DOM. */
  computeLayout: (anchor: string) => PlotLabelLayout;
}
