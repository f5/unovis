// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vis-component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
