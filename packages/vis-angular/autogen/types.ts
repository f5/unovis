import { SyntaxKind } from 'typescript'


export type ConfigProperty = {
  name: string;
  type: string;
  doc: string[];
  kind: SyntaxKind;
  optional: boolean;
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
}
