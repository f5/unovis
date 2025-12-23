import React from 'react'
import { VisXYContainer, VisAnnotations, VisAxis } from '@unovis/react'
import { AnnotationItem, TextAlign, VerticalAlign } from '@unovis/ts'

import s from './styles.module.css'

export const title = 'Annotation Options'
export const subTitle = 'Configuration Examples'

// Helper to generate grid data for visualization
const gridData = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i }))

// Common box style for visibility
const boxStyle = { background: '#f0f4ff', border: '1px dashed #aaa' }

export const component = (): React.ReactNode => {
  // ========== 1. Position (x, y) Examples ==========
  const positionAnnotations: AnnotationItem[] = [
    { x: 10, y: 10, content: 'x: 10px, y: 10px', width: 120 },
    { x: '50%', y: 20, content: 'x: 50%, y: 20px', width: 120, textAlign: TextAlign.Center },
    { x: '25%', y: '50%', content: 'x: 25%, y: 50%', width: 120 },
    { x: '75%', y: '50%', content: 'x: 75%, y: 50%', width: 120, textAlign: TextAlign.Right },
    { x: '50%', y: '90%', content: 'x: 50%, y: 90%', width: 120, textAlign: TextAlign.Center },
  ]

  // ========== 2. Size (width, height) Examples ==========
  const sizeAnnotations: AnnotationItem[] = [
    {
      x: 10,
      y: 20,
      width: 80,
      height: 40,
      content: 'w: 80, h: 40. This text should wrap within the small box.',
      ...boxStyle,
    },
    {
      x: 100,
      y: 20,
      width: 150,
      height: 60,
      content: 'w: 150, h: 60. This is a longer text that demonstrates how content wraps inside a medium-sized annotation box.',
      ...boxStyle,
    },
    {
      x: 260,
      y: 20,
      width: '30%',
      height: 80,
      content: 'w: 30%, h: 80. This annotation has a percentage-based width and contains enough text to show the wrapping behavior clearly.',
      ...boxStyle,
    },
    {
      x: 10,
      y: 120,
      width: 200,
      content: 'Auto height (no height set). The annotation will expand to fit the content automatically.',
      ...boxStyle,
    },
  ]

  // ========== 3. Vertical Align Examples ==========
  const verticalAlignAnnotations: AnnotationItem[] = [
    {
      x: 10,
      y: 10,
      width: 120,
      height: 50,
      verticalAlign: VerticalAlign.Top,
      content: [{ text: 'verticalAlign:', fontWeight: 700 }, { text: 'top' }],
      ...boxStyle,
    },
    {
      x: 140,
      y: 10,
      width: 120,
      height: 50,
      verticalAlign: VerticalAlign.Middle,
      content: [{ text: 'verticalAlign:', fontWeight: 700 }, { text: 'middle' }],
      ...boxStyle,
    },
    {
      x: 270,
      y: 10,
      width: 120,
      height: 50,
      verticalAlign: VerticalAlign.Bottom,
      content: [{ text: 'verticalAlign:', fontWeight: 700 }, { text: 'bottom' }],
      ...boxStyle,
    },
    {
      x: 10,
      y: 110,
      width: 120,
      verticalAlign: VerticalAlign.Top,
      content: [{ text: 'no height:', fontWeight: 700 }, { text: 'top' }],
      ...boxStyle,
    },
    {
      x: 140,
      y: 110,
      width: 120,
      verticalAlign: VerticalAlign.Middle,
      content: [{ text: 'no height:', fontWeight: 700 }, { text: 'middle' }],
      ...boxStyle,
    },
    {
      x: 270,
      y: 110,
      width: 120,
      verticalAlign: VerticalAlign.Bottom,
      content: [{ text: 'no height:', fontWeight: 700 }, { text: 'bottom' }],
      ...boxStyle,
    },
  ]

  // ========== 4. Text Align Examples ==========
  const textAlignAnnotations: AnnotationItem[] = [
    {
      x: 10,
      y: 10,
      width: 150,
      height: 80,
      textAlign: TextAlign.Left,
      content: [{ text: 'textAlign: left', fontWeight: 700 }, { text: 'Text is aligned to the left edge.' }],
      ...boxStyle,
    },
    {
      x: 170,
      y: 10,
      width: 150,
      height: 80,
      textAlign: TextAlign.Center,
      content: [{ text: 'textAlign: center', fontWeight: 700 }, { text: 'Text is centered.' }],
      ...boxStyle,
    },
    {
      x: 330,
      y: 10,
      width: 150,
      height: 80,
      textAlign: TextAlign.Right,
      content: [{ text: 'textAlign: right', fontWeight: 700 }, { text: 'Text is aligned to the right edge.' }],
      ...boxStyle,
    },
  ]

  // ========== 5. Text Rotation Examples ==========
  const rotationAnnotations: AnnotationItem[] = [
    { x: 60, y: '50%', width: 80, textRotationAngle: 0, content: '0°', textAlign: TextAlign.Center },
    { x: 140, y: '50%', width: 80, textRotationAngle: 45, content: '45°', textAlign: TextAlign.Center },
    { x: 220, y: '50%', width: 80, textRotationAngle: 90, content: '90°', textAlign: TextAlign.Center },
    { x: 300, y: '50%', width: 80, textRotationAngle: -45, content: '-45°', textAlign: TextAlign.Center },
    { x: 380, y: '50%', width: 80, textRotationAngle: 180, content: '180°', textAlign: TextAlign.Center },
    { x: 460, y: '50%', width: 80, textRotationAngle: -90, content: '-90°', textAlign: TextAlign.Center },
  ]

  // ========== 6. Single vs Multi-line Text ==========
  const textContentAnnotations: AnnotationItem[] = [
    {
      x: 10,
      y: 20,
      width: 150,
      content: 'Single line string',
      ...boxStyle,
    },
    {
      x: 170,
      y: 20,
      width: 150,
      content: { text: 'UnovisText object', fontSize: 14, fontWeight: 600, color: '#1C72E8' },
      ...boxStyle,
    },
    {
      x: 330,
      y: 20,
      width: 180,
      content: [
        { text: 'Multi-line Array', fontSize: 16, fontWeight: 700, color: '#1C72E8' },
        { text: 'Second line with different style', fontSize: 12, color: '#666' },
        { text: 'Third line', fontSize: 12, fontWeight: 400, marginTop: 8 },
      ],
      ...boxStyle,
    },
  ]

  // ========== 7. UnovisText Styling Options ==========
  const textStylingAnnotations: AnnotationItem[] = [
    {
      x: 10,
      y: 20,
      width: 140,
      content: [
        { text: 'fontSize: 20', fontSize: 20 },
        { text: 'fontSize: 14', fontSize: 14 },
        { text: 'fontSize: 10', fontSize: 10 },
      ],
      ...boxStyle,
    },
    {
      x: 160,
      y: 20,
      width: 140,
      content: [
        { text: 'fontWeight: 700', fontWeight: 700 },
        { text: 'fontWeight: 400', fontWeight: 400 },
        { text: 'fontWeight: 300', fontWeight: 300 },
      ],
      ...boxStyle,
    },
    {
      x: 310,
      y: 20,
      width: 140,
      content: [
        { text: 'color: #E53935', color: '#E53935' },
        { text: 'color: #43A047', color: '#43A047' },
        { text: 'color: #1E88E5', color: '#1E88E5' },
      ],
      ...boxStyle,
    },
    {
      x: 10,
      y: 120,
      width: 200,
      content: [
        { text: 'lineHeight: 2.0', lineHeight: 2.0 },
        { text: 'More space between lines', lineHeight: 2.0 },
      ],
      ...boxStyle,
    },
    {
      x: 220,
      y: 120,
      width: 200,
      content: [
        { text: 'marginTop: 20', marginTop: 20 },
        { text: 'marginBottom: 20', marginBottom: 20 },
        { text: 'After margin' },
      ],
      ...boxStyle,
    },
  ]

  return (
    <div className={s.container}>
      {/* Position Examples */}
      <div className={s.section}>
        <h3>1. Position (x, y)</h3>
        <p>Supports pixels, percentages, and calc() expressions</p>
        <VisXYContainer data={gridData} height={200}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={positionAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Size Examples */}
      <div className={s.section}>
        <h3>2. Size (width, height)</h3>
        <p>Width and height can be pixels or percentages</p>
        <VisXYContainer data={gridData} height={220}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={sizeAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Vertical Align Examples */}
      <div className={s.section}>
        <h3>3. Vertical Align</h3>
        <p>Controls vertical text position within the annotation box</p>
        <VisXYContainer data={gridData} height={180}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={verticalAlignAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Text Align Examples */}
      <div className={s.section}>
        <h3>4. Text Align</h3>
        <p>Controls horizontal text alignment</p>
        <VisXYContainer data={gridData} height={120}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={textAlignAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Rotation Examples */}
      <div className={s.section}>
        <h3>5. Text Rotation (textRotationAngle)</h3>
        <p>Rotate text by any angle in degrees</p>
        <VisXYContainer data={gridData} height={150}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={rotationAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Text Content Types */}
      <div className={s.section}>
        <h3>6. Content Types</h3>
        <p>String, UnovisText object, or UnovisText array</p>
        <VisXYContainer data={gridData} height={120}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations renderTextBoundingBoxes items={textContentAnnotations}/>
        </VisXYContainer>
      </div>

      {/* Text Styling */}
      <div className={s.section}>
        <h3>7. UnovisText Styling</h3>
        <p>fontSize, fontWeight, color, lineHeight, marginTop, marginBottom</p>
        <VisXYContainer data={gridData} height={220}>
          <VisAxis type='x' numTicks={5}/>
          <VisAxis type='y' numTicks={5}/>
          <VisAnnotations items={textStylingAnnotations}/>
        </VisXYContainer>
      </div>
    </div>
  )
}

