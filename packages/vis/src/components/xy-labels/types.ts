export type XYLabelRenderProps = {
  x: number;
  y: number;
  fontSize: number;
  backgroundColor: string | null;
  labelText: string | null;
  labelColor: string | null;
  cursor: string | null;
  width: number;
  height: number;
}

export type XYLabel<D> = D & {
  _screen: XYLabelRenderProps;
}

export type XYLabelCluster<D> = {
  _screen: XYLabelRenderProps;
  records: XYLabel<D>[];
}

export enum XYLabelPositioning {
  AbsolutePx = 'absolute_px',
  AbsolutePercentage = 'absolute_percentage',
  DataSpace = 'data_space',
}
