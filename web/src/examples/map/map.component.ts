// Copyright (c) Volterra, Inc. All rights reserved.
/* eslint-disable */
import _ from 'lodash'
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core'
import { Map } from '@volterra/vis/components'
import earthquakes from './data/earthquakes100.geo.json'

function generateData (): object[] {  
  return earthquakes.features.map(d => ({
      id: d.id,
      longitude: d.geometry.coordinates[0],
      latitude: d.geometry.coordinates[1],
      status: Math.random() < 0.4 ? _.sample(['healthy', 'warning', 'alert', 'inactive', 'pending', 're', 'approving']) : 'healthy',
      shape: Math.random() < 0.07 ? _.sample(['square', 'triangle']) : 'circle',
  }))
}

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MapComponent implements OnInit, AfterViewInit {
  title = 'map'
  map = null
  data: any
  config: any
  mapChartConfig: any
  @ViewChild('map', { static: false }) mapRef: ElementRef

  ngAfterViewInit (): void {
    this.config = getTangramMapConfig()
    this.map = new Map(this.mapRef.nativeElement, this.config, this.data)
  }

  ngOnInit (): void {
    this.data = generateData()
  }
}

function getTangramMapConfig () {
  return {
    renderer: 'tangram',
    nextzenApiKey: 'q-wBnCItTPC8Vdj8GA6g8Q',
    statusMap: {
      healthy: { color: '#47e845' },
      warning: { color: '#ffc226' },
      alert: { color: '#f8442d' },
      inactive: { color: '#acb2b9' },
      pending: { color: '#82affd', className: 'pointPending' },
      re: { color: '#4c7afc' },
      approving: { color: '#82affd' },
    }
  }
}
