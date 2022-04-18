import { SymbolType } from 'types/symbol'

export type ScatterPoint<D> = D & {
  _screen: {
    x: number;
    y: number;
    size: number;
    color: string | null;
    shape: SymbolType | string;
    label: string | null;
    labelColor: string | null;
    cursor: string | null;
  };
}
