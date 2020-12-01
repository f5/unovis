// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy } from '@angular/core'

// Viz
import { LeafletMap, LeafletMapConfigInterface, VisControlItemInterface, VisControlsOrientation } from '@volterra/vis'

@Component({
  selector: 'vis-map-leaflet',
  templateUrl: './map-leaflet.component.html',
  styleUrls: ['./map-leaflet.component.css'],
})

export class MapLeafletComponent<Datum> implements AfterViewInit, OnDestroy {
  title = 'leaflet-map'
  @ViewChild('container', { static: false }) mapRef: ElementRef
  @Input() data: Datum[]
  @Input() config: LeafletMapConfigInterface<Datum>

  map: LeafletMap<Datum>

  // Zoom Controls
  controlItems: VisControlItemInterface[] = [
    {
      icon: '&#xe986',
      callback: (): void => { this.map?.fitView() },
      borderBottom: true,
    },
    {
      icon: '&#xe936',
      callback: (): void => { this.map?.zoomIn() },
    },
    {
      icon: '&#xe934',
      callback: (): void => { this.map?.zoomOut() },
    },
  ];

  controlsOrientation = VisControlsOrientation.VERTICAL;

  ngAfterViewInit (): void {
    this.map = new LeafletMap(this.mapRef.nativeElement, this.config, this.data)
  }

  ngOnChanges (changes): void {
    // Set new Data without re-render
    if (changes.data) {
      this.map?.setData(this.data)
      delete changes.data
    }

    // Set new Config without re-render
    if (changes.config) {
      this.map?.setConfig(this.config)
    }

    // Render map
    this.map?.render()
  }

  ngOnDestroy () {
    this.map.destroy()
  }
}
