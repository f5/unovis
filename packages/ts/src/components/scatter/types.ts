import { SymbolType } from 'types/symbol'

export type ScatterPoint<D> = D & {
  _point: {
    xValue: number;
    yValue: number;
    sizePx: number;
    color: string | null;
    shape: SymbolType | string;
    label: string | null;
    labelColor: string | null;
    cursor: string | null;
  };
}
