// Copyright (c) Volterra, Inc. All rights reserved.

export type NodeDatumCore = {
  id?: number | string;
}

export type LinkDatumCore = {
  source: number | NodeDatumCore;
  target: number | NodeDatumCore;
}
