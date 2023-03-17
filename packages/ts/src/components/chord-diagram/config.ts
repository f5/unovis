/* eslint-disable dot-notation */

// Core
import { ComponentConfigInterface, ComponentConfig } from 'core/component/config'

// Types
import { ColorAccessor, GenericAccessor, NumericAccessor, StringAccessor } from 'types/accessor'

// Local Types
import { ChordInputLink, ChordInputNode, ChordLabelAlignment, ChordNodeDatum } from './types'

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
  nodeColor?: ColorAccessor<ChordNodeDatum<N>>;
  /** Node label accessor function. Default: `d => d.label ?? d.key` */
  nodeLabel?: StringAccessor<ChordNodeDatum<N>>;
  /** Node label color accessor function. Default: `undefined` */
  nodeLabelColor?: StringAccessor<ChordNodeDatum<N>>;
  /** Node label alignment. Default: `ChordLabelAlignment.Along` */
  nodeLabelAlignment?: GenericAccessor<ChordLabelAlignment | string, ChordNodeDatum<N>>;
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
  nodeColor = (d: ChordNodeDatum<N>): string => d['color']
  nodeLabel = (d: ChordNodeDatum<N>): string => d['label'] ?? d['key']
  nodeLabelColor = undefined
  nodeLabelAlignment = ChordLabelAlignment.Along
  padAngle = 0.02
  cornerRadius = 2
  angleRange: [number, number] = [0, 2 * Math.PI]
  radiusScaleExponent = 2
}
