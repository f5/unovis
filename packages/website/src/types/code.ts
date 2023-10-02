export enum Framework {
  Angular = 'angular',
  React = 'react',
  Svelte = 'svelte',
  Vue = 'vue',
  TypeScript = 'typescript',
}

export type Extension = 'ts' | 'html' | 'tsx'

export type CodeBlockContent = {
  language: Extension;
  children: string;
  title?: string;
}
