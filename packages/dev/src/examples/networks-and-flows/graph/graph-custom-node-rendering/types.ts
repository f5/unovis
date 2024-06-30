import { CustomGraphNodeType } from './enums'

export type CustomGraphData<
  N extends CustomGraphNode = CustomGraphNode,
  L extends CustomGraphLink = CustomGraphLink,
> = {
  links: L[];
  nodes: N[];
};

export type CustomGraphNode<Datum = unknown> = {
  id: string;
  datum?: Datum;
  fillColor?: string;
  label?: string;
  subLabel?: string;
  type?: CustomGraphNodeType;
  aggregationCount?: number;
  numFindings?: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  numSessions?: number;
  starred?: boolean;
  highlighted?: boolean;
  status?: ('admin' | 'crown' | 'public' | 'high-data-access' | 'eof' | 'egress' | 'ingress')[];
};

export type CustomGraphLink<Datum = unknown> = {
  source: string;
  target: string;
  bandWidth?: number;
  datum?: Datum;
  id?: string;
  label?: string;
  showArrow?: boolean;
  showFlow?: boolean;
  width?: number;
};

export type CustomGraphSwimlane = {
  index: number;
  label: string;
  x1: number;
  x2: number;
  xCenter: number;
  xMax: number;
  xMin: number;
};
