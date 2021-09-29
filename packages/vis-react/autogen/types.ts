// Copyright (c) Volterra, Inc. All rights reserved.
import { SyntaxKind } from 'typescript'

export type ConfigProperty = {
  name: string;
  type: string;
  doc: string[];
  kind: SyntaxKind;
}

export type GenericParameter = {
  name: string;
  extends: string;
  default: string;
}

export type ComponentInput = {
  name: string;
  sources: string[];
  elementSuffix?: string;
  kebabCaseName?: string;
  dataType?: string | null;
}
