/* eslint-disable dot-notation */

// Core
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { ColorAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { ChordInputLink, ChordInputNode, ChordLabelAlignment } from './types'

export interface ChordDiagramConfigInterface<N extends ChordInputNode, L extends ChordInputLink> extends ComponentConfigInterface {
  /** Link color accessor function. Default: `var(--vis-chord-diagram-link-fill-color)` */
  linkColor?: ColorAccessor<L>;
  /** Link value accessor function. Default: `l => l.value` */
  linkValue?: NumericAccessor<L>;
  /** Array of node hierarchy levels. Data records are supposed to have corresponding properties, e.g. ['level1', 'level2']. Default: `[]` */
  nodeLevels?: string[];
  /** Node width in pixels. Default: `15` */
  nodeWidth?: number;
  /** Node color accessor function ot constant value. Default: `d => d.color` */
  nodeColor?: ColorAccessor<N>;
  /** Node label accessor function. Default: `d => d.label ?? d.key` */
  nodeLabel?: StringAccessor<N>;
  /** Node label alignment. Default: `ChordLabelAlignment.Along` */
  nodeLabelAlignment?: ChordLabelAlignment | string;
  /** Pad angle in radians. Constant value or accessor function. Default: `0.02` */
  padAngle?: NumericAccessor<N>;
  /** Corner radius constant value or accessor function. Default: `2` */
  cornerRadius?: NumericAccessor<N>;
  /** Angular range of the diagram. Default: `[0, 2 * Math.PI]` */
  angleRange?: [number, number];
  /** The exponent property of the radius scale. Default: `2` */
  radiusScaleExponent?: number;
}

export class ChordDiagramConfig<N extends ChordInputNode, L extends ChordInputLink> extends ComponentConfig implements ChordDiagramConfigInterface<N, L> {
  duration = 800
  linkColor = undefined
  linkValue = (d: L): number => d['value']
  nodeLevels = []
  nodeWidth = 15
  nodeColor = (d: N): string => d['color']
  nodeLabel = (d: N): string => d['label'] ?? d['key']
  nodeLabelAlignment = ChordLabelAlignment.Along
  padAngle = 0.02
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
  radiusScaleExponent = 2
}
