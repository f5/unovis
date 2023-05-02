// Core
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { ColorAccessor, GenericAccessor, StringAccessor } from 'types/accessor'
import { NestedDonutDirection, NestedDonutLayerSettings, NestedDonutSegment } from './types'

export interface NestedDonutConfigInterface<Datum> extends ComponentConfigInterface {
  /** Diagram angle range. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Direction of hierarchy flow from root to leaf.
   * `NestedDonutDirection.Inwards` starts from the outer most radius and works towards center
   * `NestedDonutDirection.Outwards` starts from the inner most radius the consecutive layers outward.
   *  Default: `NestedDonutDirection.Inwards`
  */
  direction?: NestedDonutDirection | string;

  /** Central label text. Default: `undefined` */
  centralLabel?: string;
  /** Central sub-label accessor function or text. Default: `undefined` */
  centralSubLabel?: string;
  /** Enables wrapping for the sub-label. Default: `true` */
  centralSubLabelWrap?: boolean;
  /**
   * Show donut background. The color is configurable via
   * the `--vis-nested-donut-background-color` and `--vis-dark-nested-donut-background-color` CSS variables.
   * Default: `true`
  */
  showBackground?: boolean;

  // Layers
  /** Array of accessor functions to defined the nested groups  */
  layers: StringAccessor<Datum>[];
  /* Layer settings */
  layerSettings?: GenericAccessor<NestedDonutLayerSettings, number>;
  /* Space between layers */
  layerPadding?: number;

  // Segments
  /** Corner Radius. Default: `0` */
  cornerRadius?: number;
  /** Color accessor function for segments. Default: `undefined` */
  segmentColor?: ColorAccessor<NestedDonutSegment<Datum>>;
  /** Segment label accessor function. Default `undefined` */
  segmentLabel?: StringAccessor<NestedDonutSegment<Datum>>;
  /** Color accessor function for segment labels */
  segmentLabelColor?: ColorAccessor<NestedDonutSegment<Datum>>;
}

export class NestedDonutConfig<Datum> extends ComponentConfig implements NestedDonutConfigInterface<Datum> {
  angleRange = [0, 2 * Math.PI] as [number, number]
  centralLabel = undefined
  centralSubLabel = undefined
  centralSubLabelWrap = true
  cornerRadius = 0
  direction = NestedDonutDirection.Inwards
  layers: StringAccessor<Datum>[]
  layerPadding = 0
  layerSettings = undefined
  segmentColor = undefined
  segmentLabel = undefined
  segmentLabelColor = undefined
  showBackground = false
}
