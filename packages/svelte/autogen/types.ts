import { SyntaxKind } from 'typescript'

export type ConfigProperty = {
  name: string;
  type: string;
  doc: string[];
  kind: SyntaxKind;
  required?: boolean;
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
  styles?: string[];
}
