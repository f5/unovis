// Copyright (c) Volterra, Inc. All rights reserved.
import { SymbolType } from 'types/symbols'

export type ScatterPoint<D> = D & {
    _screen: {
        x: number;
        y: number;
        size: number;
        color: string;
        shape: SymbolType;
        label: string;
        labelColor: string;
        cursor: string;
    };
}
