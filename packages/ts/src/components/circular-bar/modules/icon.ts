import { Selection, select } from 'd3-selection'
import { Transition } from 'd3-transition'
import { interpolate } from 'd3-interpolate'

// Utils
import { smartTransition } from '@/utils/d3'
import { isInternalHref } from '@/components/graph/modules/node/helper'

// Local Types
import { CircularBarIconDatum, CircularBarIconAnimState } from '../types'

export interface IconNode extends SVGGElement {
  _animState?: CircularBarIconAnimState;
  _icon?: string;
}

function getAnimState<Datum> (d: CircularBarIconDatum<Datum>): CircularBarIconAnimState {
  return { angle: d.angle, radius: d.radius }
}

// Icons are positioned on the bar's bisector, which lets them follow the bars along the circle when animated
function getTransform (state: CircularBarIconAnimState): string {
  return `translate(${state.radius * Math.sin(state.angle)},${-state.radius * Math.cos(state.angle)})`
}

const getOpacity = <Datum>(d: CircularBarIconDatum<Datum>): number => d.visible ? 1 : 0

export function createIcon<Datum> (
  selection: Selection<SVGGElement, CircularBarIconDatum<Datum>, SVGGElement, unknown>
): void {
  selection
    .style('opacity', 0)
    .each((d, i, els) => {
      const node: IconNode = els[i]
      node._animState = getAnimState(d)
    })
    .attr('transform', d => getTransform(getAnimState(d)))
}

export function updateIcon<Datum> (
  selection: Selection<SVGGElement, CircularBarIconDatum<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  selection.each((d, i, els) => {
    const node: IconNode = els[i]
    const group = select(node)
    const isHref = isInternalHref(d.icon)

    // When the icon changes between a href and text, the icon element gets re-created
    if (node._icon !== d.icon) {
      group.selectAll('*').remove()
      group.append(isHref ? 'use' : 'text')
      node._icon = d.icon
    }

    if (isHref) {
      group.select('use')
        .attr('href', d.icon)
        .attr('x', -d.iconSize / 2)
        .attr('y', -d.iconSize / 2)
        .attr('width', d.iconSize)
        .attr('height', d.iconSize)
    } else {
      // Rendered as HTML so that icon font glyphs can be provided as character references, e.g. `&#xf004;`
      group.select('text')
        .style('font-size', `${d.iconSize}px`)
        .html(d.icon)
    }
  })

  if (duration) {
    const transition = smartTransition(selection, duration)
      .style('opacity', getOpacity) as Transition<SVGGElement, CircularBarIconDatum<Datum>, SVGGElement, unknown>
    transition.attrTween('transform', (d, i, els) => {
      const node: IconNode = els[i]
      const state = interpolate(node._animState, getAnimState(d))
      return (t: number): string => {
        node._animState = state(t)
        return getTransform(node._animState)
      }
    })
  } else {
    // Stop a running transition, otherwise it would keep moving the icon to its previous target
    selection.interrupt()
    selection
      .each((d, i, els) => {
        const node: IconNode = els[i]
        node._animState = getAnimState(d)
      })
      .attr('transform', d => getTransform(getAnimState(d)))
      .style('opacity', getOpacity)
  }
}

export function removeIcon<Datum> (
  selection: Selection<SVGGElement, CircularBarIconDatum<Datum>, SVGGElement, unknown>,
  duration: number
): void {
  smartTransition(selection, duration)
    .style('opacity', 0)
    .remove()
}
