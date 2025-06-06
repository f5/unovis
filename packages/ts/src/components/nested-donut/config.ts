// Core
import { ComponentConfigInterface, ComponentDefaultConfig } from 'core/component/config'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { NestedDonutDirection, NestedDonutLayerSettings, NestedDonutSegment } from './types'

export interface NestedDonutConfigInterface<Datum> extends ComponentConfigInterface {
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /**
   * Direction of hierarchy flow from root to leaf.
   * `NestedDonutDirection.Inwards` starts from the outer most radius and works towards center
   * `NestedDonutDirection.Outwards` starts from the inner most radius the consecutive layers outward.
   *  Default: `NestedDonutDirection.Inwards`
  */
  direction?: NestedDonutDirection | string;
  /* Numeric accessor for segment size value. Default: `undefined`. */
  value?: NumericAccessor<Datum>;

  /** Central label text. Default: `undefined` */
  centralLabel?: string;
  /** Central sub-label accessor function or text. Default: `undefined` */
  centralSubLabel?: string;
  /** Enables wrapping for the sub-label. Default: `true` */
  centralSubLabelWrap?: boolean;
  /**
   * Show donut background. The color is configurable via
   * the `--vis-nested-donut-background-color` and `--vis-dark-nested-donut-background-color` CSS variables.
   * Default: `false`
  */
  showBackground?: boolean;
  /** Sort function for segments. Default `undefined` */
  sort?: (a: NestedDonutSegment<Datum>, b: NestedDonutSegment<Datum>) => number;

  // Layers
  /** Array of accessor functions to defined the nested groups. Default: `[]` */
  layers: StringAccessor<Datum>[];
  /**
   * Configuration properties for individual layers. Accepts an accessor or constant of type:
   * {
   *   backgroundColor?: string;
   *   labelAlignment?: NestedDonutSegmentLabelAlignment;
   *   width?: number | string;
   * }
  */
  layerSettings?: GenericAccessor<NestedDonutLayerSettings, number>;
  /* Space between layers */
  layerPadding?: number;

  // Segments
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Angular size for empty segments in radians. Default: `Math.PI / 180` */
  emptySegmentAngle?: number;
  /** Hide segment labels when they don't fit. Default: `true` */
  hideOverflowingSegmentLabels?: boolean;
  /** Color accessor function for segments. Default: `undefined` */
  segmentColor?: ColorAccessor<NestedDonutSegment<Datum>>;
  /** Segment label accessor function. Default `undefined` */
  segmentLabel?: StringAccessor<NestedDonutSegment<Datum>>;
  /** Color accessor function for segment labels */
  segmentLabelColor?: ColorAccessor<NestedDonutSegment<Datum>>;
  /**
   * When true, the component will display empty segments (the ones that have `0` values) as tiny slices.
   * Default: `false`
  */
  showEmptySegments?: boolean;
  /** Show labels for individual segments. Default: `true` */
  showSegmentLabels?: boolean;
}

export const NestedDonutDefaultConfig: NestedDonutConfigInterface<unknown> = {
  ...ComponentDefaultConfig,
  angleRange: [0, 2 * Math.PI],
  centralLabel: undefined,
  centralSubLabel: undefined,
  centralSubLabelWrap: true,
  cornerRadius: 0,
  direction: NestedDonutDirection.Inwards,
  emptySegmentAngle: Math.PI / 180,
  hideOverflowingSegmentLabels: true,
  layers: [],
  layerPadding: 0,
  layerSettings: undefined,
  segmentColor: undefined,
  segmentLabel: undefined,
  segmentLabelColor: undefined,
  showBackground: false,
  showEmptySegments: false,
  showSegmentLabels: true,
  sort: undefined,
  value: undefined,
}
