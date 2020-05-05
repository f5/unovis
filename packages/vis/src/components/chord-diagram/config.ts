// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { Hierarchy, LabelType } from 'types/radial-dendrogram'
import { CurveType } from 'types/curves'

export interface ChordDiagramConfigInterface<H extends Hierarchy> extends ComponentConfigInterface {
  /** Children accessor function */
  children?: (d: H) => H[];
  /** Value accessor function */
  value?: NumericAccessor<H>;
  /** Node width value in pixels */
  nodeWidth?: number;
  /** Node color value or accessor function */
  nodeColor?: ColorAccessor<H>;
  /** Node label value or accessor function */
  nodeLabel?: StringAccessor<H>;
  /** Node label position type */
  nodeLabelType?: LabelType | string;
  /** Pad angle in radians. Value or accessor function */
  padAngle?: NumericAccessor<H>;
  /** Corner radius value or accessor function */
  cornerRadius?: NumericAccessor<H>;
  /** Dendogram angles [0, 2 * Math.PI] */
  angleRange?: [number, number];
  /** Curve type from the CurveType enum */
  curveType?: CurveType;
  /**  */
  radiusScaleExponent?: number;
}

export class ChordDiagramConfig<H extends Hierarchy> extends ComponentConfig implements ChordDiagramConfigInterface<H> {
  duration = 800
  children = (d: H): H[] => d['children'] || d['values']
  value = (d: H): number => d['value']
  nodeWidth = 15
  nodeColor = (d: H): string => d['color']
  nodeLabel = (d: H): string => d['label'] ?? d['key']
  nodeLabelType = LabelType.PERPENDICULAR
  padAngle = 0.02
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
  curveType = CurveType.CatmullRom
  radiusScaleExponent = 2
}
