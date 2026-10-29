import { GenericDataRecord } from '@/types/data'
import { LeafletMapConfigInterface } from './config'

/** The config options the cluster index is built from: changing any of them rebuilds it */
export const LEAFLET_MAP_CLUSTERING_CONFIG_KEYS: (keyof LeafletMapConfigInterface<GenericDataRecord>)[] = [
  'clusteringDistance',
  'colorMap',
  'pointShape',
  'pointLatitude',
  'pointLongitude',
]
