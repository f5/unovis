import { Component } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { D3BrushEvent } from 'd3-brush'

import { timelineData, vars, NodeDatum, LinkDatum, TimelineDatum, getData, groups } from './data'

@Component({
  selector: 'sankey-threat-campaigns',
  templateUrl: './sankey-threat-campaigns.component.html',
  styleUrls: ['./sankey-threat-campaigns.component.scss'],
})
export class SankeyThreatCampaignsComponent {
  title = 'sankey-threat-campaigns'

  actions = [
    { label: 'All', value: null },
    { label: 'Blocked', value: 'block' },
    { label: 'Allowed', value: 'allow' },
  ]

  categories = vars
  columns = ['src', 'mid', 'dest']
  dateValues = timelineData.map(d => d.time.valueOf())
  timelineData = timelineData

  color = (d: TimelineDatum): string => d.event.action === 'allow' ? '#F94D2A' : '#37CC67'
  dateTimeFormat = Intl.DateTimeFormat('en', { dateStyle: 'short', timeStyle: 'long' }).format
  subLabel = (n: NodeDatum): string => {
    const items = this.actions.slice(1).map(a => [a.label, n[a.value]].join(': '))
    if (this.action === 'block') return items[0]
    if (this.action === 'allow') return items[1]
    return items.join(' | ')
  }

  type = (d: TimelineDatum): string => d.event['threat_campaigns.name']
  x = (d: TimelineDatum): number => d.time.valueOf()

  sankeyData: { nodes: NodeDatum[]; links: LinkDatum []}
  form: FormGroup

  get dates (): string[] {
    return this.form.get('filters.dateRange').value
  }

  get keys (): string[] {
    return Object.values(this.form.get('keys').value)
  }

  get options (): string[][] {
    return this.keys.map(k => groups[k].map(n => n.label))
  }

  get action (): string {
    return this.form.get('filters.action').value
  }

  constructor (fb: FormBuilder) {
    this.form = fb.group({
      keys: fb.group({
        src: 'country',
        mid: 'threat_campaigns.name',
        dest: 'vh_name',
      }),
      vals: fb.group(
        Object.fromEntries(Object.keys(groups).map(k => [k, null, { value: null, disabled: true }]))
      ),
      filters: fb.group({
        dateRange: null,
        action: null,
      }),
    })
    this.form.get('keys').valueChanges.subscribe(() => this.clear())
    this.form.valueChanges.subscribe(() => this.updateData())
    this.updateData()
  }

  onBrush = (s: [number, number], _: D3BrushEvent<TimelineDatum>, userDriven: boolean): void => {
    if (userDriven) this.form.get('filters.dateRange').setValue(s)
  }

  updateData (): void {
    this.sankeyData = getData(
      this.keys,
      this.form.get('vals').value,
      this.form.get('filters.dateRange').value,
      this.form.get('filters.action').value
    )
  }

  clear (): void {
    this.form.get('vals').reset()
  }
}
