import { FrameworkTabsProps } from '../components/FrameworkTabs'
import { parseProps } from './helpers'

export type UiFramework = keyof Omit<FrameworkTabsProps, 'data'>

export type PropItem = {
  key: string;
  value: string;
  type?: string;
}

export type SnippetComponent<T> = {
  name: string;
  props: T;
  propTypes: Record<keyof T, string>;
  dataType?: string;
  isMain?: boolean;
  isStandAlone?: boolean;
  isContainer?: boolean;
}

export type SnippetContext = {
  imports?: Record<string, string[]>;
  declarations?: Record<string, string>;
  title?: string;
}

export type SnippetConfig<T> = SnippetContext & {
  components: SnippetComponent<T>[];
  container?: SnippetComponent<T>;
}

export interface Snippet<T extends UiFramework> {
  compact: FrameworkTabsProps[T];
  full: FrameworkTabsProps[T];
}

export abstract class CodeSnippet<T extends UiFramework> implements Snippet<T> {
  imports: Record<string, string[]>
  declarations: Record<string, string>
  components: string[] = []
  container?: string

  exampleName: string
  libraryImports: string[]

  _container
  _components = []

  abstract componentImport (name: string): string;
  abstract componentString (name: string, props: PropItem[], container?: boolean): string;

  constructor (config: SnippetConfig<unknown>) {
    this.imports = { ...config.imports }
    this.declarations = { ...config.declarations }
    this.exampleName = config.title ?? 'Component'

    const importedProps = this.imports && Object.values(this.imports).flatMap(v => v)
    const componentNames = new Set<string>()

    config.components.forEach(c => {
      componentNames.add(this.componentImport(c.name))
      const props = parseProps(c.props, c.propTypes, this.declarations, importedProps)
      if (c.isContainer) {
        this.container = this.componentString(c.name, props, true)
        this._container = { ...c, props }
      } else {
        this.components.push(this.componentString(c.name, props))
        this._components.push({ ...c, props })
      }
    })
    this.libraryImports = [...componentNames]
  }

  abstract get compact(): FrameworkTabsProps[T];
  abstract get full(): FrameworkTabsProps[T];
}
