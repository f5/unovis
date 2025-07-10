import React, { useRef } from 'react'
import { VisXYContainer, VisArea, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { CrosshairCircle, getStackedValues, ContinuousScale, getColor, CurveType } from '@unovis/ts'

export const title = 'No data snapping'
export const subTitle = 'Custom getCircles function'
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateXYDataRecords(25)
  const accessors = [
    (d: XYDataRecord, i: number) => (d.y || 0) * i / 100,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  // Custom getCircles function that interpolates values between data points
  const getCircles = (x: number | Date, dataArray: XYDataRecord[], yScale: ContinuousScale): CrosshairCircle[] => {
    if (!dataArray.length || !yScale) return []

    // Convert Date to number if needed
    const xValue = x instanceof Date ? x.getTime() : x

    // Clamp x to the data range
    const minX = dataArray[0].x
    const maxX = dataArray[dataArray.length - 1].x
    const clampedX = Math.max(minX, Math.min(maxX, xValue))

    // Find the two closest data points for interpolation
    let leftIndex = 0
    let rightIndex = dataArray.length - 1

    for (let i = 0; i < dataArray.length - 1; i++) {
      if (dataArray[i].x <= clampedX && dataArray[i + 1].x >= clampedX) {
        leftIndex = i
        rightIndex = i + 1
        break
      }
    }

    const leftPoint = dataArray[leftIndex]
    const rightPoint = dataArray[rightIndex]

    // Calculate interpolation factor with bounds checking
    const factor = leftPoint.x === rightPoint.x ? 0 : Math.max(0, Math.min(1, (clampedX - leftPoint.x) / (rightPoint.x - leftPoint.x)))

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
  const template = (d: XYDataRecord | undefined, x: number | Date, nearestDatumIndex?: number, data?: XYDataRecord[]): string => {
    if (!data || !data.length) return ''

    // Convert Date to number if needed
    const xValue = x instanceof Date ? x.getTime() : x

    // Clamp x to the data range
    const minX = data[0].x
    const maxX = data[data.length - 1].x
    const clampedX = Math.max(minX, Math.min(maxX, xValue))

    const leftIndex = Math.floor(clampedX)
    const rightIndex = Math.min(leftIndex + 1, data.length - 1)
    const factor = Math.max(0, Math.min(1, clampedX - leftIndex))

    const interpolatedValues = accessors.map((accessor, index) => {
      const leftValue = accessor(data[leftIndex], leftIndex) || 0
      const rightValue = accessor(data[rightIndex], rightIndex) || 0
      const interpolated = leftValue + (rightValue - leftValue) * factor
      return isNaN(interpolated) ? 0 : interpolated
    })

    // Create a mock datum for stacking calculation
    const interpolatedDatum = { ...data[leftIndex] } as XYDataRecord
    accessors.forEach((accessor, index) => {
      interpolatedDatum[`y${index}` as keyof XYDataRecord] = interpolatedValues[index]
    })

    // Calculate stacked values
    const stackedValues = getStackedValues(interpolatedDatum, leftIndex, ...accessors)

    return `
      <div style="padding: 0px; font-size: 12px;">
        <div><strong>X: ${clampedX.toFixed(2)}</strong></div>
        <div>Nearest Datum Index: ${nearestDatumIndex}</div>
        <div>Series 1: ${interpolatedValues[0].toFixed(2)}</div>
        <div>Series 2: ${interpolatedValues[1].toFixed(2)}</div>
        <div>Series 3: ${interpolatedValues[2].toFixed(2)}</div>
        <div><strong>Stacked Total: ${stackedValues[stackedValues.length - 1]?.toFixed(2) || '0.00'}</strong></div>
      </div>
    `
  }

  return (
    <VisXYContainer<XYDataRecord> data={data} margin={{ top: 5, left: 5 }}>
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
