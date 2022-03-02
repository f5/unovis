// Copyright (c) Volterra, Inc. All rights reserved.
import { Component } from '@angular/core'
import { SankeyConfigInterface, NodeAlignType, FitMode } from '@volterra/vis'

import { loginFlowData, SankeyLink, SankeyNode } from './sankey-login-flow.data'

@Component({
  selector: 'sankey-login-flow',
  templateUrl: './sankey-login-flow.component.html',
  styleUrls: ['./sankey-login-flow.component.scss'],
})
export class SankeyLoginFlowComponent {
  title = 'sankey-login-flow'

  // Data
  sankeyConfig: SankeyConfigInterface<SankeyNode, SankeyLink> = {
    nodePadding: 40,
    labelMaxWidth: 190,
    label: (d) => d.label,
    nodeColor: (d) => d.color,
    linkValue: (d) => d.flow,
    subLabel: (d) => d.sublabel,
    nodeAlign: NodeAlignType.Left,
    labelFit: FitMode.Wrap,
    labelPosition: d => d.orientation,
  };

  sankeyData = loginFlowData;
}
