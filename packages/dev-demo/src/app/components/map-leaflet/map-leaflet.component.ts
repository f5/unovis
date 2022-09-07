import { Component, ViewChild, ElementRef, SimpleChanges, AfterViewInit, Input, OnDestroy } from '@angular/core'

// Viz
import {
  LeafletMap,
  LeafletMapConfigInterface,
  LeafletFlowMap,
  LeafletFlowMapConfigInterface,
  VisControlItemInterface,
  VisControlsOrientation,
} from '@unovis/ts'

type FlowMapData<P, L> = {
  points: P[];
  flows: L[];
}

@Component({
  selector: 'vis-map-leaflet',
  templateUrl: './map-leaflet.component.html',
  styleUrls: ['./map-leaflet.component.css'],
})
export class MapLeafletComponent<PointDatum, FlowDatum = any> implements AfterViewInit, OnDestroy {
  title = 'leaflet-map'
  @ViewChild('container', { static: false }) mapRef: ElementRef
  @Input() data: PointDatum[] | FlowMapData<PointDatum, FlowDatum>
  @Input() config: LeafletMapConfigInterface<PointDatum> | LeafletFlowMapConfigInterface<PointDatum, FlowDatum>
  @Input() ddos = false

  map: LeafletMap<PointDatum> | LeafletFlowMap<PointDatum, FlowDatum>

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
  ]

  controlsOrientation = VisControlsOrientation.Vertical

  ngAfterViewInit (): void {
    this.map = this.ddos
      ? new LeafletFlowMap(this.mapRef.nativeElement, this.config, this.data as FlowMapData<PointDatum, FlowDatum>)
      : new LeafletMap(this.mapRef.nativeElement, this.config, this.data as PointDatum[])
  }

  ngOnChanges (changes: SimpleChanges): void {
    if (!this.map) return

    // Set new Data without re-render
    if (changes.data) {
      if (this.ddos) (this.map as LeafletFlowMap<PointDatum, FlowDatum>).setData(this.data as FlowMapData<PointDatum, FlowDatum>)
      else (this.map as LeafletMap<PointDatum>).setData(this.data as PointDatum[])
      delete changes.data
    }

    // Set new Config without re-render
    if (changes.config) {
      this.map.setConfig(this.config)
    }

    // Render map
    this.map.render()
  }

  ngOnDestroy (): void {
    this.map.destroy()
  }
}
