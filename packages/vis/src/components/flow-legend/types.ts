export enum FlowLegendItemType {
  Label = 'label',
  Symbol = 'symbol',
}

export interface FlowLegendItem {
  text: string;
  type: FlowLegendItemType;
  index: number;
}
