import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { CrosshairCircle, getStackedValues, ContinuousScale, getColor, CurveType } from '@unovis/ts'

export const title = 'Free Crosshair'
export const subTitle = 'No Snapping, custom getCircles and template'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateXYDataRecords(25)
  const accessors = [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  // Custom getCircles function that interpolates values between data points
  const getCircles = (x: number | Date, dataArray: XYDataRecord[], yScale: ContinuousScale, leftNearestDatumIndex: number): CrosshairCircle[] => {
    // Convert Date to number if needed
    const xValue = x instanceof Date ? x.getTime() : x

    if (!dataArray.length || !yScale || xValue > dataArray[dataArray.length - 1].x || xValue < dataArray[0].x) return []

    // Use leftNearestDatumIndex to get the left point
    const leftIndex = leftNearestDatumIndex
    const rightIndex = Math.min(leftIndex + 1, dataArray.length - 1)

    const leftPoint = dataArray[leftIndex]
    const rightPoint = dataArray[rightIndex]

    // Calculate interpolation factor
    const factor = leftPoint.x === rightPoint.x ? 0 : Math.max(0, Math.min(1, (xValue - leftPoint.x) / (rightPoint.x - leftPoint.x)))

    // Interpolate values for each accessor
    const interpolatedValues = accessors.map((accessor, index) => {
      const leftValue = accessor(leftPoint, leftIndex) || 0
      const rightValue = accessor(rightPoint, rightIndex) || 0
      const interpolated = leftValue + (rightValue - leftValue) * factor
      return isNaN(interpolated) ? 0 : interpolated
    })

    // Calculate stacked y positions (cumulative sum)
    const stackedYs: number[] = []
    interpolatedValues.reduce((sum, val, i) => {
      const stacked = sum + val
      stackedYs[i] = stacked
      return stacked
    }, 0)

    // Create circles with stacked y positions
    return stackedYs.map((value, index) => {
      if (value === undefined || isNaN(value)) return null
      const yPos = yScale(value)
      return {
        y: isNaN(yPos) ? 0 : yPos,
        color: getColor(leftPoint, undefined, index),
        opacity: 0.8,
        strokeColor: '#fff',
        strokeWidth: 2,
        id: `circle-${index}`,
      }
    }).filter(Boolean) as CrosshairCircle[]
  }

  // Custom template function that shows interpolated values
  // eslint-disable-next-line padded-blocks
  const template = (d: XYDataRecord | undefined, xVal: number | Date, data: XYDataRecord[], leftNearestDatumIndex: number): string => {
    // eslint-disable-next-line no-console
    console.log('X Value:', (+xVal).toFixed(1), 'Left Index:', leftNearestDatumIndex)

    // Convert Date to number if needed
    const xValue = xVal instanceof Date ? xVal.getTime() : xVal

    if (!data || !data.length || xValue > data[data.length - 1].x || xValue < data[0].x) return ''

    // Use leftNearestDatumIndex to get the left point
    const leftIndex = leftNearestDatumIndex
    const rightIndex = Math.min(leftIndex + 1, data.length - 1)

    const leftPoint = data[leftIndex]
    const rightPoint = data[rightIndex]

    // Calculate interpolation factor
    const factor = leftPoint.x === rightPoint.x ? 0 : Math.max(0, Math.min(1, (xValue - leftPoint.x) / (rightPoint.x - leftPoint.x)))

    const interpolatedValues = accessors.map((accessor, index) => {
      const leftValue = accessor(leftPoint, leftIndex) || 0
      const rightValue = accessor(rightPoint, rightIndex) || 0
      const interpolated = leftValue + (rightValue - leftValue) * factor
      return isNaN(interpolated) ? 0 : interpolated
    })

    // Create a mock datum for stacking calculation
    const interpolatedDatum = { ...leftPoint } as XYDataRecord
    accessors.forEach((accessor, index) => {
      interpolatedDatum[`y${index}` as keyof XYDataRecord] = interpolatedValues[index]
    })

    // Calculate stacked values
    const stackedValues = getStackedValues(interpolatedDatum, leftIndex, ...accessors)

    return `
      <div style="padding: 0px; font-size: 12px;">
        <div><strong>X: ${xValue.toFixed(2)}</strong></div>
        <div>Left Index: ${leftNearestDatumIndex}</div>
        <div>Series 1: ${interpolatedValues[0].toFixed(2)}</div>
        <div>Series 2: ${interpolatedValues[1].toFixed(2)}</div>
        <div>Series 3: ${interpolatedValues[2].toFixed(2)}</div>
        <div><strong>Stacked Total: ${stackedValues[stackedValues.length - 1]?.toFixed(2) || '0.00'}</strong></div>
      </div>
    `
  }

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }} xDomain={[-2, 26]}>
      <VisArea x={d => d.x} y={accessors} duration={props.duration} curveType={CurveType.Linear}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair
        snapToData={false}
        getCircles={getCircles}
        template={template}
      />
      <VisTooltip ref={tooltipRef} container={document.body} horizontalShift={10}/>
    </VisXYContainer>
  )
}
