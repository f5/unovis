/* eslint-disable */
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core'
import { TopoJSONMap, Tooltip, MapData, SingleContainer } from '@unovis/ts'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

import { maps, Country, Area } from './data'

@Component({
  selector: 'topojson-map',
  templateUrl: './topojson-country-maps.component.html',
  styleUrls: ['./topojson-country-maps.component.css'],
})
export class TopoJSONCountryMapsComponent implements AfterViewInit {
  legendItems = [{
    name: 'Detailed Map Available',
    hidden: false,
  }, {
    name: 'Return to World View',
    hidden: true,
    color: 'var(--vis-color0)',
  }]
  isWorldView = true
  tooltip = new Tooltip({
    triggers: {
      [TopoJSONMap.selectors.feature]: d => d.properties.name
    },
  })
  topojsons = maps.reduce((obj, m) => ({ ...obj, [m.id]: new TopoJSONMap(m.config, m.data) }), {})
  worldMap = new TopoJSONMap<Country>({
    topojson: WorldMapTopoJSON,
    areaColor: 'var(--vis-color0)',
    events: {
      [TopoJSONMap.selectors.feature]: {
        click: c => {
          if (this.topojsons[c.id]) {
            this.setMap(this.topojsons[c.id])
            this.isWorldView = false
            this.countryName = c.properties.name
            this.featureName = this.topojsons[c.id].config.mapFeatureName
            this.toggleLegend()
          }
        }
      }
    }
  }, { areas: maps })

  container: SingleContainer<MapData<Country | Area>>
  countryName = undefined
  featureName = undefined
  @ViewChild('topojsonmap') chart: ElementRef

  toggleLegend(): void {
    this.legendItems = this.legendItems.map(i => ({ ...i, hidden: !i.hidden}))
  }

  setMap(map: TopoJSONMap<Country | Area>): void {
    this.container.removeAllChildren()
    this.container.updateContainer({
      component: map,
      tooltip: this.tooltip
    })
  }

  resetView(): void {
    this.setMap(this.worldMap)
    if (!this.isWorldView) {
      this.toggleLegend()
    }
    this.isWorldView = true
  }

  ngAfterViewInit (): void {
    this.container = new SingleContainer(this.chart.nativeElement)
    this.resetView()
  }
}
