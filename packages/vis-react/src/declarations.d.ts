// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vis-component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'vis-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'vis-crosshair': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'vis-axis': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
