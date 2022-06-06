export enum ContextLevel {
  Full = 'full', // show typescript declarations for all components in doc
  Container = 'container', // exclude ts lines, keep container and components
  Minimal = 'minimal', // only include main component and related ts lines
}

export type DocComponent = {
  name: string;
  props: Record<string, any>;
  key?: string; // key in ts chart config
}

export type DocCompositeProps = {
  containerProps: DocComponent;
  componentProps: DocComponent[];
}

export type DocTabsProps = {
  container: DocComponent;
  context: ContextLevel;
  components: DocComponent[];
  mainComponent: DocComponent;
  dataType: string;
  declarations?: Record<string, string>;
  hideTabLabels?: boolean;
  imports: Record<string, string[]>;
  showData?: boolean;
}

export type DocWrapperProps = DocTabsProps & DocCompositeProps & {
  data: any[];
  name: string; // name of main component to render, i.e. "Line" will import VisLine */
  configKey: string; // specify the key for the chartConfig in typescript files
  className?: string;
  height?: number;
  showAxes?: boolean;
  containerProps?: any;
  componentProps?: DocComponent[];
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Record<string, any>; // props to pass to component but exclude from doc tabs
} & Record<string, any> // remaining props will be passed directly to component
