// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, AfterViewInit } from '@angular/core'
import _sample from 'lodash/sample'

import { TopoJSONMap, Tooltip, WorldMapTopoJSON } from '@volterra/vis'

import cities from './data/cities_big.json'

type HeatMapPoint = {
  id: string,
  latitude: number,
  longitude: number,
  city: string,
  color: string,
}

@Component({
  selector: 'topojson-heatmap',
  templateUrl: './topojson-heatmap.component.html',
  styleUrls: ['./topojson-heatmap.component.css'],
})

export class TopoJSONHeatMapComponent implements AfterViewInit {
  title = 'topojson-heatmap'
  data: { nodes: HeatMapPoint[] } = { nodes: cities.map(c => ({...c, color: _sample(['#FF2C00','#08E084', '#F7CD67'])})) }
  config = {
    topojson: WorldMapTopoJSON,
    duration: 2500,
    pointColor: d => d.color,
    heatmapMode: true,
  }
  component = new TopoJSONMap<HeatMapPoint, any, any>(this.config)
  tooltip = new Tooltip<any, any>({
    triggers: {
      [TopoJSONMap.selectors.point]: d => `<span>${d.city}</span>`,
    },
  })

  ngAfterViewInit (): void {
  }
}
