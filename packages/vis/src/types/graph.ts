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
  _id: string;
  _index: number;
  _isConnected: boolean;

  _state: Record<string, any>;
}

export type GraphLinkCore<N extends GraphInputNode, L extends GraphInputLink> = L & {
  source: GraphNodeCore<N, L>;
  target: GraphNodeCore<N, L>;

  _id: string;
  _index: number;
  _neighbours: number;
  _direction: -1 | 1;
  _state: Record<string, any>;
}
