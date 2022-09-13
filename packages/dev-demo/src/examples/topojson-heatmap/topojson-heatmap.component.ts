import { Component, AfterViewInit } from '@angular/core'
import { scaleLinear } from 'd3-scale'

import { TopoJSONMap, Tooltip, VisControlItemInterface, VisControlsOrientation } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

import cities from './data/cities_big.json'

type HeatMapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  color: string;
}

@Component({
  selector: 'topojson-heatmap',
  templateUrl: './topojson-heatmap.component.html',
  styleUrls: ['./topojson-heatmap.component.css'],
})

export class TopoJSONHeatMapComponent implements AfterViewInit {
  title = 'topojson-heatmap'
  colorScale = scaleLinear<string>().domain([1, 10]).range(['#BFD8FF', '#0065FF'])
  data: { points: HeatMapPoint[] } = { points: cities.map(c => ({ ...c, color: this.colorScale(1 + 10 * Math.random()) })) }
  config = {
    topojson: WorldMapTopoJSON,
    duration: 2500,
    pointColor: d => d.color,
    pointLabel: d => d.city.substr(0, 1),
    heatmapMode: true,
  }

  component = new TopoJSONMap<undefined, HeatMapPoint, undefined>(this.config)
  tooltip = new Tooltip({
    triggers: {
      [TopoJSONMap.selectors.point]: (d: HeatMapPoint) => `<span>${d.city}</span>`,
    },
  })

  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: () => { this.component.fitView() },
      borderBottom: true,
    },
    {
      icon: '&#xe936',
      callback: () => { this.component.zoomIn() },
    },
    {
      icon: '&#xe934',
      callback: () => { this.component.zoomOut() },
    },
  ]

  controlsOrientation = VisControlsOrientation.Vertical

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngAfterViewInit (): void {}
}
