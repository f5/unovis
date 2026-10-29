import '@angular/compiler'
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { Injector, runInInjectionContext, SimpleChange, TemplateRef, ViewContainerRef, EmbeddedViewRef } from '@angular/core'
import type { Tooltip, TooltipContent, TooltipContentMap, TooltipContentRenderer } from '@unovis/ts'
import { VisTooltipComponent } from './tooltip.component'

function createFixture (): {
  wrapper: VisTooltipComponent;
  views: { template: TemplateRef<TooltipContent>; context: TooltipContent; destroyed: boolean; checks: number }[];
  render: (content: TooltipContent | null) => void;
  update: (content?: TooltipContentMap<TemplateRef<TooltipContent>>) => void;
  hidden: () => number;
} {
  const views: { template: TemplateRef<TooltipContent>; context: TooltipContent; destroyed: boolean; checks: number }[] = []
  const viewContainer = {
    createEmbeddedView: (template: TemplateRef<TooltipContent>, context: TooltipContent): EmbeddedViewRef<TooltipContent> => {
      const view = { template, context, destroyed: false, checks: 0, rootNodes: [] }
      views.push(view)
      return Object.assign(view, {
        destroy: (): void => { view.destroyed = true },
        detectChanges: (): void => { view.checks += 1 },
      }) as unknown as EmbeddedViewRef<TooltipContent>
    },
  }
  const injector = Injector.create({ providers: [{ provide: ViewContainerRef, useValue: viewContainer }] })
  const wrapper = runInInjectionContext(injector, () => new VisTooltipComponent())
  let renderer: TooltipContentRenderer | undefined
  let hides = 0
  wrapper.component = {
    setConfig: (): void => undefined,
    setContentRenderer: (value: TooltipContentRenderer): void => { renderer = value },
    hide: (): void => { hides += 1 },
  } as unknown as Tooltip
  const update = (content?: TooltipContentMap<TemplateRef<TooltipContent>>): void => {
    const previous = wrapper.content
    wrapper.content = content
    wrapper.ngOnChanges({ content: new SimpleChange(previous, content, previous === undefined) })
  }
  return {
    wrapper,
    views,
    render: (content): void => { renderer?.(content) },
    update,
    hidden: (): number => hides,
  }
}

test('replaces a visible template with the current datum without another chart event', () => {
  const fixture = createFixture()
  const first = {} as TemplateRef<TooltipContent>
  const second = {} as TemplateRef<TooltipContent>
  fixture.update({ point: first })
  const context = { datum: { value: 42 }, trigger: 'point' }
  fixture.render(context)
  fixture.update({ point: second })
  assert.equal(fixture.views.length, 2)
  assert.equal(fixture.views[0].destroyed, true)
  assert.equal(fixture.views[1].template, second)
  assert.equal(fixture.views[1].context, context)
  assert.equal(fixture.views[1].checks, 1)
})

for (const [label, removed] of [['an empty map', {}], ['an undefined entry', { point: undefined }], ['an undefined map', undefined]] as const) {
  test(`removes a visible template immediately for ${label}`, () => {
    const fixture = createFixture()
    fixture.update({ point: {} as TemplateRef<TooltipContent> })
    fixture.render({ datum: 42, trigger: 'point' })
    fixture.update(removed)
    assert.equal(fixture.views[0].destroyed, true)
    assert.equal(fixture.hidden(), 1)
  })
}

test('does not recreate a hidden view when content changes', () => {
  const fixture = createFixture()
  fixture.update({ point: {} as TemplateRef<TooltipContent> })
  fixture.render({ datum: 42, trigger: 'point' })
  fixture.render(null)
  fixture.update({ point: {} as TemplateRef<TooltipContent> })
  assert.equal(fixture.views.length, 1)
  assert.equal(fixture.views[0].destroyed, true)
})

test('retains the active view for changes to an unrelated template', () => {
  const fixture = createFixture()
  const point = {} as TemplateRef<TooltipContent>
  fixture.update({ point })
  const context = { datum: 42, trigger: 'point' }
  fixture.render(context)
  fixture.update({ point, line: {} as TemplateRef<TooltipContent> })
  assert.equal(fixture.views.length, 1)
  assert.equal(fixture.views[0].destroyed, false)
  assert.equal(fixture.views[0].context, context)
})
