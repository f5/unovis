import { AfterViewInit, OnDestroy, Component } from '@angular/core'

// Vis
import { RadialDendrogram, RadialDendrogramConfigInterface, Hierarchy } from '@unovis/ts'

// Helpers
import { getHierarchyData } from '../../utils/data'

@Component({
  selector: 'radial-dendrogram',
  templateUrl: './radial-dendrogram.component.html',
  styleUrls: ['./radial-dendrogram.component.css'],
})

export class RadialDendrogramComponent<H extends Hierarchy> implements AfterViewInit, OnDestroy {
  title = 'radial-dendrogram'

  data = getHierarchyData(100, {
    source: ['re01', 're02', 're03', 're04', 're05', 're06', 're07', 're08'],
    middle: ['vhost 1', 'vhost 2', 'vhost 3'],
    target: ['site1', 'site2', 'site3', 'site4', 'site5', 'site6', 'site7', 'site8', 'site9', 'site10'],
  })

  margin = {}
  config: RadialDendrogramConfigInterface<H> = {
    nodeWidth: 20,
  }

  component = new RadialDendrogram(this.config)
  intervalId: NodeJS.Timeout

  ngAfterViewInit (): void {
    this.intervalId = setInterval(() => {
      this.data = getHierarchyData(100, {
        source: ['re01', 're02', 're03', 're04', 're05', 're06', 're07', 're08'],
        middle: ['vhost', 'vhost 2', 'vhost 3'],
        target: ['site1', 'site2', 'site3', 'site4', 'site5', 'site6', 'site7', 'site8', 'site9', 'site10'],
      })
    }, 3000)
  }

  ngOnDestroy (): void {
    clearInterval(this.intervalId)
  }
}
