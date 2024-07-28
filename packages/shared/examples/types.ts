export type Example = {
  title: string;
  pathname: string;
  description: string | JSX.Element;
  component: () => JSX.Element;
  codeReact: string;
  codeTs: string;
  codeAngular: {
    module: string;
    component: string;
    html: string;
  };
  codeSvelte: string;
  codeVue: string;
  codeSolid: string;
  data: string;
  preview: string;
  previewDark?: string;
  constants?: string;
  styles?: string;
}

export type ExampleCollection = {
  title: string;
  description: string | JSX.Element;
  examples: Example[];
}
