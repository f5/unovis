import { SyntaxKind } from 'typescript'

// Copyright (c) Volterra, Inc. All rights reserved.
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
  provide: string;
  kebabCaseName?: string;
  dataType?: string;
  hasNoRender?: boolean;
}
