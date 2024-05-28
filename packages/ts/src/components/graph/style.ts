import { css, injectGlobal } from '@emotion/css'
import { UNOVIS_ICON_FONT_FAMILY_DEFAULT } from 'styles/index'

// Nodes
import * as nodeSelectors from './modules/node/style'

// Links
import * as linkSelectors from './modules/link/style'

export const variables = injectGlobal`
  :root {
    --vis-graph-icon-font-family: ${UNOVIS_ICON_FONT_FAMILY_DEFAULT};

    /* Brush */
    --vis-graph-brush-selection-opacity: 0.2;
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

export const brush = css`
  label: brush;

  :not(.active) {
    display: none;
  }

  .active {
    .selection {
      fill-opacity: 0;
      stroke: none;
    }

    .handle {
      display: none;
    }
  }
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
