import { SyntaxKind } from 'typescript'

// Copyright (c) Volterra, Inc. All rights reserved.
export type ConfigProperty = {
  name: string;
  type: string;
  doc: string[];
  kind: SyntaxKind;
}
