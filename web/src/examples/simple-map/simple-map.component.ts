// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core'
import _times from 'lodash/times'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { SingleChart, TopoJSONMap, Tooltip, WorldMapTopoJSON } from '@volterra/vis'

import cities from './data/cities.json'
import areas from './data/areas.json'

type MapPoint = {
  id: string,
  latitude: number,
  longitude: number,
  city: string,
}

@Component({
  selector: 'simplemap',
  templateUrl: './simple-map.component.html',
  styleUrls: ['./simple-map.component.css'],
})

export class SimpleMapComponent implements OnInit, AfterViewInit {
  title = 'simple-map'
  chart: any
  data: { nodes: MapPoint[] }
  config: any
  @ViewChild('simplemap', { static: false }) simpleMap: ElementRef

  ngAfterViewInit (): void {
    const data = {
      nodes: cities as MapPoint[],
      areas: areas.slice(0, 30).map(a => ({
        id: a['ISO'],
        name: a.Country,
        color: '#ef8f73',
      })),
      links: _times(10).map(i => ({
        source: _sample(cities).id,
        target: _sample(cities).id,
        width: _random(1, 5),
      })),
    }

    const config = {
      component: new TopoJSONMap<MapPoint, any, any>({
        topojson: WorldMapTopoJSON,
        pointLabel: d => d.city.substr(0, 2),
      }),
      tooltip: new Tooltip<any, any>({
        triggers: {
          [TopoJSONMap.selectors.point]: d => `<span>${d.city}</span>`,
          // [TopoJSONMap.selectors.feature]: d => `<span>${d.properties.name}</span>`,
        },
      }),
    }
    new SingleChart(this.simpleMap.nativeElement, config, data)

  }

  ngOnInit (): void {
  }
}
