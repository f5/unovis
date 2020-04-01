// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { NumericAccessor, ColorAccessor, StringAccessor } from 'types/misc'

export interface RadialDendrogramConfigInterface<HierarchyData> extends ComponentConfigInterface {
  /** Children accessor function */
  children?: (d: HierarchyData) => HierarchyData[];
  /** Value accessor function */
  value?: NumericAccessor<HierarchyData>;
  /** Node width value or accessor function */
  nodeWidth?: NumericAccessor<HierarchyData>;
  /** Node color value or accessor function */
  nodeColor?: ColorAccessor<HierarchyData>;
  /** Node color value or accessor function */
  nodeLabel?: StringAccessor<HierarchyData>;
  /** Pad angle value or accessor function */
  padAngle?: NumericAccessor<HierarchyData>;
  /** Corner radius value or accessor function */
  cornerRadius?: NumericAccessor<HierarchyData>;
  /** Dendogram angles [0, 2 * Math.PI] */
  angleRange?: [number, number];
}

export class RadialDendrogramConfig<HierarchyData> extends ComponentConfig implements RadialDendrogramConfigInterface<HierarchyData> {
  duration = 800
  children = (d: HierarchyData): HierarchyData[] => d['children'] || d['values']
  value = (d: HierarchyData): number => d['value']
  nodeWidth = 15
  nodeColor = (d: HierarchyData): string => d['color']
  nodeLabel = (d: HierarchyData): string => d['label'] ?? d['key']
  padAngle = 0.01
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
}
