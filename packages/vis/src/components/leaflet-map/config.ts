// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable dot-notation */
import { LatLng } from 'leaflet'
// Core
import { ComponentConfig, ComponentConfigInterface } from 'core/component/config'
import { Tooltip } from 'core/tooltip'

// Types
import { NumericAccessor, StringAccessor, ColorAccessor } from 'types/misc'
import { LeafletMapRenderer, ClusterOutlineType, Bounds, StatusMap } from 'types/map'
import { LeafletMap } from './index'

export interface LeafletMapConfigInterface<Datum> extends ComponentConfigInterface {
  renderer?: LeafletMapRenderer | string;
  /**  */
  tamgramRenderer?: any;
  /** Mapboxgl Access Token or Nextzen API key */
  accessToken?: string;
  /** Mapbox style glyphs URL */
  mapboxglGlyphs?: string;
  /** Tangram or Mapbox sources settings */
  sources?: {};
  /** Tangram or Mapbox style renderer settings */
  rendererSettings?: {};
  /** Function */
  onMapMoveZoom?: (({ mapCenter, zoomLevel, bounds }: { mapCenter: LatLng; zoomLevel: number; bounds: Bounds }) => any);
  /** Point longitude accessor function or value */
  pointLongitude?: NumericAccessor<Datum>;
  /** Point latitude accessor function or value */
  pointLatitude?: NumericAccessor<Datum>;
  /** Point id accessor function or value */
  pointId?: StringAccessor<Datum>;
  /** Point status accessor function or value */
  pointStatus?: StringAccessor<Datum>;
  /** Point shape accessor function or value */
  pointShape?: StringAccessor<Datum>;
  /** Point color accessor function or value */
  pointColor?: ColorAccessor<Datum>;
  /** Point radius accessor function or value */
  pointRadius?: NumericAccessor<Datum>;
  /** Point stroke width accessor function or value */
  pointStrokeWidth?: NumericAccessor<Datum>;
  /** Cluster point outline type */
  clusterOutlineType?: ClusterOutlineType;
  /** Cluster point outline width */
  clusterOutlineWidth?: number;
  /** Use cluster background */
  clusterBackground?: boolean;
  /** FlyTo Duration */
  flyToDuration?: number;
  /** Default bounds that will be applid on the first map render if the bounds property is not set */
  initialBounds?: Bounds;
  /** Force set map bounds */
  bounds?: Bounds;
  /** Status styles */
  statusMap?: StatusMap;
  /** If selectedNodeId is provided the map will zoom in and select that node on update */
  selectedNodeId?: string;
  /** A TopoJSON Geometry layer to be displayed on top of the map. Supports fill and stroke */
  topoJSONLayer?: {
    sources?: TopoJSON.Topology;
    featureName?: string;
    fillProperty?: string;
    strokeProperty?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
    strokeWidth?: number;
  };
  /** Tooltip component */
  tooltip?: Tooltip<LeafletMap<Datum>, Datum>;
}

export class LeafletMapConfig<Datum> extends ComponentConfig implements LeafletMapConfigInterface<Datum> {
  renderer = LeafletMapRenderer.TANGRAM
  accessToken = ''
  onMapMoveZoom = undefined
  pointLongitude = (d: Datum): number => d['longitude']
  pointLatitude = (d: Datum): number => d['latitude']
  pointId = (d: Datum): string => d['id']
  pointStatus = (d: Datum): string => d['status']
  pointShape = (d: Datum): string => d['shape']
  pointColor = (d: Datum): string => d['color']
  pointRadius = undefined
  pointStrokeWidth = 1
  clusterOutlineType = ClusterOutlineType.DONUT
  clusterOutlineWidth = 1.25
  clusterBackground = true
  flyToDuration = 2000
  initialBounds = undefined
  bounds = undefined
  statusMap = {}
  selectedNodeId = undefined
  topoJSONLayer = {
    sources: undefined,
    fillOpacity: 0.6,
    strokeOpacity: 0.8,
    strokeWidth: 1,
  }

  tooltip = undefined
}
