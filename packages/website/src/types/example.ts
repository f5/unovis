export type Example = {
  title: string;
  component: () => JSX.Element;
  preview: string;
  codeReact: string;
  codeTs: string;
  codeAngular: {
    module: string;
    component: string;
    html: string;
  };
}

export type ExampleCollection = {
  title: string;
  description: string;
  examples: Example[];
}
