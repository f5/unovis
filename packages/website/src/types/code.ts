export enum Framework {
  Angular = 'angular',
  React = 'react',
  Svelte = 'svelte',
  TypeScript = 'typescript',
}

export type Extention = 'ts' | 'html' | 'tsx'

export type CodeBlockContent = {
  language: Extention;
  children: string;
  title?: string;
}
