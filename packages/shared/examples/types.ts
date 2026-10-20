export type Example = {
  title: string;
  kicker?: string;
  subtitle?: string;
  prompt: string;
  legacyTitles?: string[];
  sources?: { name: string; url: string }[];
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
  dependencies?: Record<string, string>;
}

export type ExampleCollection = {
  title: string;
  description: string | JSX.Element;
  examples: Example[];
}
