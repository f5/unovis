// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { Hierarchy } from './types'

export interface RadialDendrogramConfigInterface<H extends Hierarchy> extends ComponentConfigInterface {
  /** Children accessor function. Default: `d.children || d.values` */
  children?: (d: H) => H[];
  /** Value accessor function. Default: `d => d.value` */
  value?: NumericAccessor<H>;
  /** Array of node hierarchy levels. Data records are supposed to have corresponding properties, e.g. ['site', 'sublabel']. Default: `[]` */
  nodeLevels?: string[];
  /** Node width in pixels. Default: `15` */
  nodeWidth?: number;
  /** Node color accessor function ot constant value. Default: `d => d.color` */
  nodeColor?: ColorAccessor<H>;
  /** Node label accessor function. Default: `d => d.label ?? d.key` */
  nodeLabel?: StringAccessor<H>;
  /** Pad angle in radians. Constant value or accessor function. Default: `0.02` */
  padAngle?: NumericAccessor<H>;
  /** Corner radius constant value or accessor function. Default: `2` */
  cornerRadius?: NumericAccessor<H>;
  /** Angular range of the diagram. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
}

export class RadialDendrogramConfig<H extends Hierarchy> extends ComponentConfig implements RadialDendrogramConfigInterface<H> {
  duration = 800
  children = (d: H): H[] => d['children'] || d['values']
  value = (d: H): number => d['value']
  nodeWidth = 15
  nodeColor = (d: H): string => d['color']
  nodeLabel = (d: H): string => d['label'] ?? d['key']
  padAngle = 0.01
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
}
