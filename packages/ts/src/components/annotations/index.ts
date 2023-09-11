import { select, Selection } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { renderTextIntoFrame } from 'utils/text'
import { parseUnit } from 'utils/misc'

// Types
import { Spacing } from 'types/spacing'

// Local Types
import { AnnotationItem, AnnotationSubject } from './types'

// Config
import { AnnotationsDefaultConfig, AnnotationsConfigInterface } from './config'

// Styles
import * as s from './style'

export class Annotations extends ComponentCore<unknown[], AnnotationsConfigInterface> {
  static selectors = s
  static cssVariables = s.variables
  protected _defaultConfig = AnnotationsDefaultConfig as AnnotationsConfigInterface
  public config: AnnotationsConfigInterface = this._defaultConfig

  g: Selection<SVGGElement, unknown, null, undefined>

  events = {}

  constructor (config?: AnnotationsConfigInterface) {
    super()
    if (config) this.setConfig(config)
  }

  // Todo: implement
  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const annotations = this.g
      .selectAll<SVGGElement, AnnotationItem>(`.${s.annotation}`)
      .data(config.items ?? [])

    const annotationsEnter = annotations.enter().append('g')
      .attr('class', s.annotation)

    annotationsEnter.append('g').attr('class', s.annotationContent)
    const annotationsSubject = annotationsEnter.append('g').attr('class', s.annotationSubject)
    annotationsSubject.append('circle')
    annotationsSubject.append('line')

    // Todo: smooth transition
    annotationsEnter.merge(annotations)
      .each((annotation, i, elements) => {
        // Content rendering
        const contentGroupElement = elements[i].querySelector<SVGGElement>(`.${s.annotationContent}`)
        const content = typeof annotation.content === 'string' ? { text: annotation.content, fontSize: 12 } : annotation.content
        const x = parseUnit(annotation.x, this._width)
        const y = parseUnit(annotation.y, this._height)
        const width = parseUnit(annotation.width, this._width)
        const height = parseUnit(annotation.height, this._height)
        const options = { ...annotation, x, y, width, height }
        renderTextIntoFrame(contentGroupElement, content, options)

        // Subject rendering
        requestAnimationFrame(() => this._renderSubject(elements[i], annotation.subject, duration))
      })

    smartTransition(annotations.exit(), duration)
      .style('opacity', 0)
      .remove()
  }

  private _renderSubject (
    annotationGroupElement: SVGGElement,
    subject: AnnotationSubject | undefined,
    duration?: number
  ): void {
    const contentGroupElement = annotationGroupElement.querySelector<SVGGElement>(`.${s.annotationContent}`)
    const subjectGroupElement = annotationGroupElement.querySelector<SVGGElement>(`.${s.annotationSubject}`)
    const subjectGroup = select(subjectGroupElement)

    const subjectX: number | null = parseUnit(typeof subject?.x === 'function' ? subject.x() : subject?.x, this._width) ?? null
    const subjectY: number | null = parseUnit(typeof subject?.y === 'function' ? subject.y() : subject?.y, this._height) ?? null
    const subjectStrokeColor: string | null = subject?.strokeColor ?? null
    const subjectFillColor: string | null = subject?.fillColor ?? null
    const subjectStrokeDasharray: string | null = subject?.strokeDasharray ?? null
    const connectorLineColor: string | null = subject?.connectorLineColor ?? null
    const connectorLineStrokeDasharray: string | null = subject?.connectorLineStrokeDasharray ?? null
    const subjectRadius: number | null = subject?.radius ?? 0
    const padding = subject?.padding ?? 5

    const contentBbox = contentGroupElement.getBBox()
    const dy = Math.abs(subjectY - (contentBbox.y + contentBbox.height / 2))
    const dx = Math.abs(subjectX - (contentBbox.x + contentBbox.width / 2))
    const annotationPadding = 5
    const x2 = (dx < dy) && ((subjectY < contentBbox.y) || (subjectY > (contentBbox.y + contentBbox.height)))
      ? contentBbox.x + contentBbox.width / 2
      : (subjectX < contentBbox.x) ? contentBbox.x - annotationPadding : contentBbox.x + contentBbox.width + annotationPadding

    const y2 = (dx >= dy) || ((subjectY >= contentBbox.y) && (subjectY <= (contentBbox.y + contentBbox.height)))
      ? contentBbox.y + contentBbox.height / 2
      : (subjectY < contentBbox.y) ? contentBbox.y - annotationPadding : contentBbox.y + contentBbox.height + annotationPadding

    const angle = Math.atan2(y2 - subjectY, x2 - subjectX) * 180 / Math.PI
    const x1 = subjectX + Math.cos(angle * Math.PI / 180) * (subjectRadius + padding)
    const y1 = subjectY + Math.sin(angle * Math.PI / 180) * (subjectRadius + padding)

    const circleSelection = subjectGroup.select('circle')
    const lineSelection = subjectGroup.select('line')
    circleSelection
      .attr('visibility', subject ? null : 'hidden')
      .attr('cx', subjectX)
      .attr('cy', subjectY)
      .attr('r', subjectRadius)
      .style('stroke', subjectStrokeColor)
      .style('fill', subjectFillColor)
      .style('stroke-dasharray', subjectStrokeDasharray)

    lineSelection
      .attr('visibility', subject ? null : 'hidden')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .style('stroke', connectorLineColor)
      .style('stroke-dasharray', connectorLineStrokeDasharray)
      .style('fill', 'none')
  }
}
