// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --sankey-link-color: #d0e0ea;
    --sankey-link-opacity: 0.9;
    --sankey-link-hover-color: #76a1ba;
    --vis-color-sankey-node: #2196f3;
    --sankey-node-border-color: rgba(0, 0, 0, 0);
    --sankey-node-border-width: 10px;
    --vis-color-sankey-node-hover: rgba(0, 0, 0, 0.45);
    --sankey-node-border-hover-color: rgba(0, 0 ,0, 0);
    --sankey-node-label-size: 12px;
    --sankey-node-label-color: #000000;
    --sankey-node-icon-size: 22px;
    --vis-color-sankey-icon: #ffffff;
    --sankey-node-icon-font-family: FontAwesome;
  }
`
