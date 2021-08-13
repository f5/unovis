// Copyright (c) Volterra, Inc. All rights reserved.
export enum FlowLegendItemType {
  Label = 'label',
  Symbol = 'symbol',
}

export interface FlowLegendItem {
  text: string;
  type: FlowLegendItemType;
  index: number;
}
