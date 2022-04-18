import { select } from 'd3-selection'

export function getHTMLTransform (el): number[] {
  const results = select(el).style('transform')
    .match(/matrix(?:(3d)\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*)), -{0,1}\d+\.?\d*\)|\(-{0,1}\d+\.?\d*(?:, -{0,1}\d+\.?\d*)*(?:, (-{0,1}\d+\.?\d*))(?:, (-{0,1}\d+\.?\d*))\))/)

  if (!results) return [0, 0, 0]
  if (results[1] === '3d') return results.slice(2, 5).map(d => +d)

  results.push('0')
  return results.slice(5, 8).map(d => +d)
}
