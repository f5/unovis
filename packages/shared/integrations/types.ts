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
  kebabCaseName?: string;
  dataType?: string | null;
  elementSuffix?: string;
  isStandAlone?: boolean;
}

export type ReactComponentInput = ComponentInput

export type AngularComponentInput = ComponentInput & {
  angularProvide: string;
  angularStyles?: string[];
}

export type SvelteComponentInput = ComponentInput & {
  svelteStyles?: string[];
}

export type VueComponentInput = ComponentInput & {
  vueStyles?: string[];
}

export type SolidComponentInput = ComponentInput & {
  solidStyles?: string[];
}
