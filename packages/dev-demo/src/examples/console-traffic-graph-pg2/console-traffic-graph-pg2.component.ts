/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash-es/times'
import _sample from 'lodash-es/sample'
import _random from 'lodash-es/random'
import _cloneDeep from 'lodash-es/cloneDeep'
import _uniq from 'lodash-es/uniq'

import { Graph, SingleContainer, GraphConfigInterface } from '@unovis/ts'

import { overviewConfig, getPanels } from './configuration/graph-config'
import consoleData from './data/traffic.json'
consoleData.nodes.forEach((n, i) => n['order'] = i)
consoleData.links.forEach((l, i) => l['id'] = i+1)
@Component({
  selector: 'console-traffic-graph-pg2',
  templateUrl: './console-traffic-graph-pg2.component.html',
  styleUrls: ['./console-traffic-graph-pg2.component.scss'],
})

export class TrafficGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', { static: false }) graph: ElementRef
  title = 'graph'
  chart: any
  layoutType = 'parallel'
  expandedSite = ''
  mainSite = 'ce01-ashburn-aws'
  overviewData = this.preareData(consoleData)
  config: GraphConfigInterface<any, any> = overviewConfig(this.overviewData, this.onNodeClick.bind(this))
  panels = getPanels(this.overviewData).filter(p => (p.label === this.mainSite) || (p.label === this.expandedSite) )


  component = new Graph({ ...this.config, panels: this.panels })

  ngAfterViewInit (): void {
    this.chart = new SingleContainer(this.graph.nativeElement, { duration: 1000, component: this.component }, this.overviewData)
  }

  ngOnInit (): void {
  }

  onNodeClick(d): void {
    this.expandedSite = d.site
    const newData = this.preareData(consoleData)

    this.config.panels = getPanels(newData).filter(p => (p.label === this.mainSite) || (p.label === this.expandedSite) )
    this.chart.setData(newData, false)
    this.chart.updateComponent(this.config)
  }

  onClick(type) {
    this.layoutType = type
    this.config.layoutType = this.layoutType
    this.config.panels = this.config.layoutType === 'parallel' ? this.panels : []
    this.chart.setData(this.config.layoutType === 'parallel' ? this.overviewData : consoleData, false)
    this.chart.updateComponent(this.config)
  }

  preareData(data) {
    const sites = _uniq(data.nodes.map(n => n.site))
    const groupedData = { nodes: [], links: _cloneDeep(data.links) }

    for (const site of sites) {
      const nodes = data.nodes.filter(n => n.site === site)

      if ((site === this.expandedSite) || (site === this.mainSite)) {
        groupedData.nodes.splice(0, 0, ...nodes)
        continue
      }

      const groupNode = {
        id: `${site}-node`,
        nodeSize: 60,
        site,
        shape: nodes.length === 1 ? 'square' : 'circle',
        score: 0,
        order: nodes[0].order,
        icon: site === 'ce01-ashburn-aws' ? '&#xe9a0;'
          : site === 'ce02-paris-azure' ? '&#xe9a2;'
          : '&#xe946;',
        label: site,
        sublabel: '',
        group: nodes[0].group,
        subgroup: nodes[0].subgroup,
        sideLabels: [{
          text: nodes.length,
        }],
      }
      groupedData.nodes.push(groupNode)

      // Update link source and target with the group node id
      for (const l of groupedData.links) {
         if (nodes.some(n => n.id === l.source)) l.source = groupNode.id
         if (nodes.some(n => n.id === l.target)) l.target = groupNode.id
      }

    }


    // Remove self-directed links
    groupedData.links = groupedData.links.filter(l => l.source !== l.target)

    groupedData.nodes.sort((a, b) => a.order - b.order)
    return groupedData
  }
}
