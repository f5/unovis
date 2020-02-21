// Copyright (c) Volterra, Inc. All rights reserved.

export type NodeDatumCore = {
  id?: number | string;
}

export type LinkDatumCore = {
  id?: number | string;
  source: number | string | NodeDatumCore;
  target: number | string | NodeDatumCore;
}
