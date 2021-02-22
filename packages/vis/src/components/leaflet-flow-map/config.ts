// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */

// Config
import { LeafletMapConfig, LeafletMapConfigInterface } from 'components/leaflet-map/config'

// Types
import { ColorAccessor, NumericAccessor } from 'types/misc'

export interface LeafletFlowMapConfigInterface<P, F> extends LeafletMapConfigInterface<P> {
  /** Flow source point longitude accessor function or value. Default:.`f => f.sourceLongitude` */
  sourceLongitude?: NumericAccessor<F>;
  /** Flow source point latitude accessor function or value. Default: `f => f.sourceLatitude` */
  sourceLatitude?: NumericAccessor<F>;
  /** Flow target point longitude accessor function or value. Default: `f => f.targetLongitude` */
  targetLongitude?: NumericAccessor<F>;
  /** Flow target point latitude accessor function or value. Default: `f => f.targetLatitude` */
  targetLatitude?: NumericAccessor<F>;
  /** Flow source point radius accessor function or value. Default: `3` */
  sourcePointRadius?: NumericAccessor<F>;
  /** Source point color accessor function or value. Default: `'#88919f'` */
  sourcePointColor?: ColorAccessor<F>;
  /** Flow particle color accessor function or value. Default: `'#949dad'` */
  flowParticleColor?: ColorAccessor<F>;
  /** Flow particle radius accessor function or value. Default: `1.1` */
  flowParticleRadius?: NumericAccessor<F>;
  /** Flow particle speed accessor function or value in angular degrees. Default: `0.07` */
  flowParticleSpeed?: NumericAccessor<F>;
  /** Flow particle density accessor function or value on the range of [0, 1]. Default: `0.6` */
  flowParticleDensity?: NumericAccessor<F>;
}

export class LeafletFlowMapConfig<P, F> extends LeafletMapConfig<P> implements LeafletFlowMapConfigInterface<P, F> {
  sourceLongitude = (f: F): number => f['sourceLongitude']
  sourceLatitude = (f: F): number => f['sourceLatitude']
  targetLongitude = (f: F): number => f['targetLongitude']
  targetLatitude = (f: F): number => f['targetLatitude']
  sourcePointRadius = 3
  sourcePointColor = '#88919f'
  flowParticleColor = '#949dad'
  flowParticleRadius = 1.1
  flowParticleSpeed = 0.07
  flowParticleDensity = 0.6
}
