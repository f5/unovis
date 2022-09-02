import { css, injectGlobal } from '@emotion/css'
import { DEFAULT_ICON_FONT_FAMILY } from 'styles/css-variables'

// Nodes
import * as nodeSelectors from './modules/node/style'

// Links
import * as linkSelectors from './modules/link/style'

export const variables = injectGlobal`
  :root {
    --vis-graph-icon-font-family: ${DEFAULT_ICON_FONT_FAMILY};
  }
`

// General
export const root = css`
  label: graph-component;
`

export const background = css`
  label: background;
`

export const graphGroup = css`
  label: graph-group;
`

export const zoomOutLevel1 = css`
  label: zoom-out-level-1;

  ${`.${nodeSelectors.label}`} {
    rect {
      stroke: none;
    }
  }
`

export const zoomOutLevel2 = css`
  label: zoom-out-level-2;

  ${`.${nodeSelectors.label}`} {
    visibility: visible;
  }

  ${`.${nodeSelectors.nodeGauge}`} {
    visibility: visible;
  }

  ${`.${nodeSelectors.node}`} {
    stroke-width: 4px;
  }

  rect${`.${nodeSelectors.node}`} {
    stroke-width: 2px;
  }

  ${`.${linkSelectors.gLink}`} {
    animation: none;
    stroke-dasharray: none;
  }

  ${`.${linkSelectors.flowCircle}`} {
    display: none;
  }

  ${`.${nodeSelectors.nodeSelection}`} {
    &${`.${nodeSelectors.nodeSelectionActive}`} {
      transform: scale(1.15);
    }
  }
`
