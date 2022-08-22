export interface GraphInputNode {
  id?: number | string;
}

export interface GraphInputLink {
  id?: number | string;
  source: number | string | GraphInputNode;
  target: number | string | GraphInputNode;
}

export type GraphNodeCore<N extends GraphInputNode, L extends GraphInputLink> = N & {
  // eslint-disable-next-line no-use-before-define
  links: GraphLinkCore<N, L>[];
  /** Unique id */
  _id: string;
  /** Index as in the original data array */
  _index: number;
  /** True when the node has links */
  _isConnected: boolean;
  /** Internal state for node rendering */
  _state: Record<string, any>;
}

export type GraphLinkCore<N extends GraphInputNode, L extends GraphInputLink> = L & {
  source: GraphNodeCore<N, L>;
  target: GraphNodeCore<N, L>;

  /** Unique id */
  _id: string;
  /** Index as in the original data array */
  _indexGlobal: number;
  /**  Local index, when there are multiple links between two nodes */
  _index: number;
  /** The number of neighbour links */
  _neighbours: number;
  /** Link direction */
  _direction: -1 | 1;
  /** Internal state for link rendering */
  _state: Record<string, any>;
}
