import { select, Selection } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { renderTextIntoFrame } from 'utils/text'
import { parseUnit } from 'utils/misc'
import { UNOVIS_TEXT_DEFAULT } from 'styles'

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

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this

    const duration = isNumber(customDuration) ? customDuration : config.duration

    const annotations = this.g.selectAll<SVGGElement, AnnotationItem[]>(`.${s.annotation}`)
      .data(config.items, d => JSON.stringify(d))

    const annotationsEnter = annotations.enter().append('g')
      .attr('class', s.annotation)
      .style('opacity', 0)

    // Content
    annotationsEnter.append('g').attr('class', s.annotationContent)

    const annotationsMerged = annotationsEnter.merge(annotations)
      .attr('cursor', d => d?.cursor)
      .each((annotation, i, elements) => {
        if (annotation.content) {
          const content = typeof annotation.content === 'string' ? { ...UNOVIS_TEXT_DEFAULT, text: annotation.content } : annotation.content
          const x = parseUnit(annotation.x, this._width)
          const y = parseUnit(annotation.y, this._height)
          const width = parseUnit(annotation.width, this._width)
          const height = parseUnit(annotation.height, this._height)
          const options = { ...annotation, x, y, width, height }

          const contentGroupElement = select(elements[i]).select<SVGGElement>(`.${s.annotationContent}`)
          renderTextIntoFrame(contentGroupElement.node(), content, options)

          // Render debug bounding boxes showing the frame (x, y, width, height)
          contentGroupElement.selectAll(`.${s.debugBoundingBox}`).remove()
          if (config.renderTextBoundingBoxes) {
            const debugWidth = width ?? 100
            const debugHeight = height || 0.1
            contentGroupElement.append('rect')
              .attr('class', s.debugBoundingBox)
              .attr('x', x)
              .attr('y', y)
              .attr('width', debugWidth)
              .attr('height', debugHeight)
          }
        }

        if (annotation.subject) {
          requestAnimationFrame(() => this._renderSubject(elements[i], annotation.subject))
        } else {
          select(elements[i]).select(`.${s.annotationSubject}`).remove()
        }
      })

    smartTransition(annotationsMerged, duration)
      .style('opacity', 1)

    smartTransition(annotations.exit(), duration)
      .style('opacity', 0)
      .remove()
  }


  private _renderSubject (
    annotationGroupElement: SVGElement,
    subject: AnnotationSubject | undefined
  ): void {
    const annotationGroup = select(annotationGroupElement)
    const contentGroup = annotationGroup.select<SVGGElement>(`.${s.annotationContent}`)

    // Create subject group if it doesn't exist
    let subjectGroup = annotationGroup.select<SVGGElement>(`.${s.annotationSubject}`)
    if (subjectGroup.empty()) {
      subjectGroup = annotationGroup.append('g').attr('class', s.annotationSubject)
      subjectGroup.append('circle')
      subjectGroup.append('line')
    }

    const subjectX: number | null = parseUnit(typeof subject?.x === 'function' ? subject.x() : subject?.x, this._width) ?? null
    const subjectY: number | null = parseUnit(typeof subject?.y === 'function' ? subject.y() : subject?.y, this._height) ?? null

    const subjectStrokeColor: string | null = subject?.strokeColor ?? null
    const subjectFillColor: string | null = subject?.fillColor ?? null
    const subjectStrokeDasharray: string | null = subject?.strokeDasharray ?? null
    const connectorLineColor: string | null = subject?.connectorLineColor ?? null
    const connectorLineStrokeDasharray: string | null = subject?.connectorLineStrokeDasharray ?? null
    const subjectRadius: number | null = subject?.radius ?? 0
    const padding = subject?.padding ?? 5

    const contentBbox = contentGroup.node().getBBox()
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

    subjectGroup.select('circle')
      .attr('cx', subjectX)
      .attr('cy', subjectY)
      .attr('r', subjectRadius)
      .style('stroke', subjectStrokeColor)
      .style('fill', subjectFillColor)
      .style('stroke-dasharray', subjectStrokeDasharray)

    subjectGroup.select('line')
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x1)
      .attr('y2', y1)
      .attr('x2', x2)
      .attr('y2', y2)
      .style('stroke', connectorLineColor)
      .style('stroke-dasharray', connectorLineStrokeDasharray)
  }
}
