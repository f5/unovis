// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'

// Viz
import { LeafletMap, LeafletMapConfigInterface } from '@volterra/vis'

@Component({
  selector: 'vis-map-leaflet',
  templateUrl: './map-leaflet.component.html',
  styleUrls: ['./map-leaflet.component.css'],
})

export class MapLeafletComponent<Datum> implements AfterViewInit {
  title = 'leaflet-map'
  @ViewChild('container', { static: false }) mapRef: ElementRef
  @Input() data: Datum[]
  @Input() config: LeafletMapConfigInterface<Datum>

  map: LeafletMap<Datum>

  ngAfterViewInit (): void {
    this.map = new LeafletMap(this.mapRef.nativeElement, this.config, this.data)
  }

  ngOnChanges (changes): void {
    // setBounds
    // selectNode
    // zoomToNode
  }
}
