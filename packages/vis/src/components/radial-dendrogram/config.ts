// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'
import { Hierarchy } from 'types/radial-dendrogram'

export interface RadialDendrogramConfigInterface<H extends Hierarchy> extends ComponentConfigInterface {
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
  /** Pad angle in radians. Value or accessor function */
  padAngle?: NumericAccessor<H>;
  /** Corner radius value or accessor function */
  cornerRadius?: NumericAccessor<H>;
  /** Dendogram angles [0, 2 * Math.PI] */
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
