export type Example = {
  title: string;
  pathname: string;
  description: string | JSX.Element;
  component: () => JSX.Element;
  preview: string;
  codeReact: string;
  codeTs: string;
  codeAngular: {
    module: string;
    component: string;
    html: string;
  };
  data: string;
}

export type ExampleCollection = {
  title: string;
  description: string | JSX.Element;
  examples: Example[];
}