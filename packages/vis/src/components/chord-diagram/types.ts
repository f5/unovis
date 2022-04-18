export interface ChordInputNode {
  id?: string;
}

export interface ChordInputLink {
  id?: string;
  source: number | string | ChordInputNode;
  target: number | string | ChordInputNode;
}
