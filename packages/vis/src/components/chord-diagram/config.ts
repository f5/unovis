// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { HierarchyNode } from 'd3-hierarchy'

// Core
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'
import { Hierarchy, LabelType } from 'components/radial-dendrogram/types'
import { CurveType } from 'types/curve'

// Local Types
import { ChordInputNode } from './types'

export interface ChordDiagramConfigInterface<H extends ChordInputNode> extends ComponentConfigInterface {
  /** Children accessor function. Default: `d.children || d.values` */
  children?: (d: H) => H[];
  /** Value accessor function. Default: `d => d.value` */
  value?: NumericAccessor<H>;
  /** Array of node hierarchy levels. Data records are supposed to have corresponding properties, e.g. ['site', 'sublabel']. Default: `[]` */
  nodeLevels?: string[];
  /** Node width in pixels. Default: `15` */
  nodeWidth?: number;
  /** Node color accessor function ot constant value. Default: `d => d.color` */
  nodeColor?: ColorAccessor<HierarchyNode<H>>;
  /** Node label accessor function. Default: `d => d.label ?? d.key` */
  nodeLabel?: StringAccessor<H>;
  /** Node label position. Default: `LabelType.Perpendicular` */
  nodeLabelType?: LabelType | string;
  /** Pad angle in radians. Constant value or accessor function. Default: `0.02` */
  padAngle?: NumericAccessor<H>;
  /** Corner radius constant value or accessor function. Default: `2` */
  cornerRadius?: NumericAccessor<H>;
  /** Angular range of the diagram. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** Curve type. Default: `CurveType.CatmullRom` */
  curveType?: CurveType;
  /** The exponent property of the radius scale. Default: `2` */
  radiusScaleExponent?: number;
}

export class ChordDiagramConfig<H extends Hierarchy> extends ComponentConfig implements ChordDiagramConfigInterface<H> {
  duration = 800
  children = (d: H): H[] => d['children'] || d['values']
  value = (d: H): number => d['value']
  nodeLevels = []
  nodeWidth = 15
  nodeColor = (d: HierarchyNode<H>): string => d['color']
  nodeLabel = (d: H): string => d['label'] ?? d['key']
  nodeLabelType = LabelType.Perpendicular
  padAngle = 0.02
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
  curveType = CurveType.CatmullRom
  radiusScaleExponent = 2
}
