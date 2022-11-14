import { AfterViewInit, Component } from '@angular/core'
import _times from 'lodash-es/times'

// Vis
import { Sankey, SankeyConfigInterface } from '@unovis/ts'

import { sankeySampleData } from './data/datagen'

function sampleSankeyData (n: number): { nodes: unknown[]; links: unknown[]} {
  const sources = _times(n).map((d) => `RE ${d + 1}`)
  const targets = ['Site', 'VN selector', 'Endpoint 3', 'Endpoint 2', 'Endpoint 3']
  const vhost = ['Balancer']
  const result = sankeySampleData(n, sources, vhost, targets)
  return n === 1 ? { nodes: [result.nodes[0]], links: [] } : result
}

function getSankeyConfig (): SankeyConfigInterface<any, any> {
  return {
    label: d => d.label,
    linkValue: d => d.flow,
    labelMaxWidth: 110,
    subLabel: d => d.sublabel,
    // labelVisibility: (d, bbox, hovered) => { return hovered || (d.y1 - d.y0) > 0.8 * bbox.height },
  }
}

@Component({
  selector: 'sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.css'],
})

export class SankeyComponent implements AfterViewInit {
  title = 'sankey'
  component = Sankey

  dataGenerator = sampleSankeyData
  configGenerator = getSankeyConfig

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngAfterViewInit (): void {}
}
