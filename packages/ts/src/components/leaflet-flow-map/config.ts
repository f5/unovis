/* eslint-disable dot-notation */

// Config
import { LeafletMapDefaultConfig, LeafletMapConfigInterface } from '@/components/leaflet-map/config'

// Types
import { ColorAccessor, NumericAccessor } from '@/types/accessor'
import { GenericDataRecord } from '@/types/data'

export interface LeafletFlowMapConfigInterface<PointDatum extends GenericDataRecord, FlowDatum extends GenericDataRecord> extends LeafletMapConfigInterface<PointDatum> {
  /** Flow source point longitude accessor function or value. Default:.`f => f.sourceLongitude` */
  sourceLongitude?: NumericAccessor<FlowDatum>;
  /** Flow source point latitude accessor function or value. Default: `f => f.sourceLatitude` */
  sourceLatitude?: NumericAccessor<FlowDatum>;
  /** Flow target point longitude accessor function or value. Default: `f => f.targetLongitude` */
  targetLongitude?: NumericAccessor<FlowDatum>;
  /** Flow target point latitude accessor function or value. Default: `f => f.targetLatitude` */
  targetLatitude?: NumericAccessor<FlowDatum>;
  /** Flow source point radius accessor function or value. Default: `3` */
  sourcePointRadius?: NumericAccessor<FlowDatum>;
  /** Source point color accessor function or value. Default: `'#88919f'` */
  sourcePointColor?: ColorAccessor<FlowDatum>;
  /** Flow particle color accessor function or value. Default: `'#949dad'` */
  flowParticleColor?: ColorAccessor<FlowDatum>;
  /** Flow particle radius accessor function or value. Default: `1.1` */
  flowParticleRadius?: NumericAccessor<FlowDatum>;
  /** Flow particle speed accessor function or value. The unit is arbitrary, recommended range is 0 – 0.2. Default: `0.07` */
  flowParticleSpeed?: NumericAccessor<FlowDatum>;
  /** Flow particle density accessor function or value on the range of [0, 1]. Default: `0.6` */
  flowParticleDensity?: NumericAccessor<FlowDatum>;

  // Events
  /** Flow source point click callback function. Default: `undefined` */
  onSourcePointClick?: (f: FlowDatum, x: number, y: number, event: MouseEvent) => void;
  /** Flow source point mouse over callback function. Default: `undefined` */
  onSourcePointMouseEnter?: (f: FlowDatum, x: number, y: number, event: MouseEvent) => void;
  /** Flow source point mouse leave callback function. Default: `undefined` */
  onSourcePointMouseLeave?: (f: FlowDatum, event: MouseEvent) => void;
}

export const LeafletFlowMapDefaultConfig: LeafletFlowMapConfigInterface<GenericDataRecord, GenericDataRecord> = {
  ...LeafletMapDefaultConfig,
  sourceLongitude: (f: unknown): number => (f as { sourceLongitude: number }).sourceLongitude as number,
  sourceLatitude: (f: unknown): number => (f as { sourceLatitude: number }).sourceLatitude as number,
  targetLongitude: (f: unknown): number => (f as { targetLongitude: number }).targetLongitude as number,
  targetLatitude: (f: unknown): number => (f as { targetLatitude: number }).targetLatitude as number,
  sourcePointRadius: 3,
  sourcePointColor: '#88919f',
  flowParticleColor: '#949dad',
  flowParticleRadius: 1.1,
  flowParticleSpeed: 0.07,
  flowParticleDensity: 0.6,
  onSourcePointClick: undefined,
  onSourcePointMouseEnter: undefined,
  onSourcePointMouseLeave: undefined,
}
