// Copyright (c) Volterra, Inc. All rights reserved.
import {
  WebGLRenderer, OrthographicCamera, Scene, BufferGeometry, Points,
  BufferAttribute, InterleavedBufferAttribute, ShaderMaterial, Color,
} from 'three'

import { Particle } from './types'

import { vertex, fragment } from './shaders'
import { DEFAULT_POINT_RADIUS, getRadius, getColor } from './renderer-utils'

export class PointRenderer {
  private width: number
  private height: number
  private devicePixelRatio = window.devicePixelRatio || 1
  private containerNode: HTMLDivElement
  private renderer: WebGLRenderer
  private rendererCanvasElement: HTMLCanvasElement
  private readonly camera: OrthographicCamera
  private readonly scene: Scene

  // Points
  private pointsGeometry: BufferGeometry | undefined
  private pointsBuffer: Points | undefined
  private pointsPositions: BufferAttribute | InterleavedBufferAttribute | undefined
  private pointsColors: BufferAttribute | InterleavedBufferAttribute | undefined
  private pointsSizes: BufferAttribute | InterleavedBufferAttribute | undefined
  private pointData: Particle[] = []

  constructor (containerNode: HTMLDivElement, width: number, height: number, canvas?: HTMLCanvasElement) {
    this.containerNode = containerNode
    this.width = width
    this.height = height

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(this.devicePixelRatio)
    this.renderer.setClearColor(0x00000000, 0)
    this.renderer.clear()

    if (!canvas) {
      this.rendererCanvasElement = this.renderer.domElement
      this.rendererCanvasElement.style.position = 'absolute'
      this.rendererCanvasElement.style.top = '0'
      this.containerNode.appendChild(this.rendererCanvasElement)
    }

    // Set up camera
    this.camera = new OrthographicCamera(-0, this.width, -0, this.height, 0)

    // Set up scene
    this.scene = new Scene()

    // Initialize geometry of points
    this.initGeometry()
  }

  private initGeometry (): void {
    const pointsMaterial = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(0xffffff) },
        size: { value: DEFAULT_POINT_RADIUS },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    })
    this.pointsGeometry = new BufferGeometry()
    this.pointsBuffer = new Points(this.pointsGeometry, pointsMaterial)
    this.pointsBuffer.frustumCulled = false
    this.scene.add(this.pointsBuffer)
    this.camera.lookAt(this.scene.position)
  }

  private initPointsAttributes (): void {
    const numPoints = this.pointData.length
    const pointsPositions = new Float32Array(numPoints * 3)
    const pointsColors = new Float32Array(numPoints * 4)
    const pointsSizes = new Float32Array(numPoints)
    this.pointsGeometry?.setAttribute('position', new BufferAttribute(pointsPositions, 3))
    this.pointsGeometry?.setAttribute('customColor', new BufferAttribute(pointsColors, 4))
    this.pointsGeometry?.setAttribute('size', new BufferAttribute(pointsSizes, 1))
    this.pointsPositions = this.pointsBuffer?.geometry.attributes.position
    this.pointsColors = this.pointsBuffer?.geometry.attributes.customColor
    this.pointsSizes = this.pointsBuffer?.geometry.attributes.size
  }

  public draw (): void {
    this.renderer.render(this.scene, this.camera)
  }

  public update (points: Particle[]): void {
    this.pointData = points

    this.initPointsAttributes()
    this.pointData.forEach((p, i) => {
      const color = getColor(p.color)
      const opacity = 1
      const radius = getRadius(p.r, this.devicePixelRatio)
      this.pointsColors?.setXYZW(i, color.r, color.g, color.b, opacity)
      this.pointsSizes?.setX(i, radius)
    })
    const pointsColors = this.pointsColors as BufferAttribute
    const pointsSizes = this.pointsSizes as BufferAttribute
    pointsColors.needsUpdate = true
    pointsSizes.needsUpdate = true

    this.updatePointsPosition(points)
  }

  public updatePointsPosition (points: Particle[]): void {
    points.forEach((p, i) => {
      this.pointsPositions?.setXYZ(i, p.x, p.y, 0)
    })
    const pointsPosition = this.pointsPositions as BufferAttribute
    pointsPosition.needsUpdate = true
  }

  public setSize (width: number, height: number): void {
    this.width = width
    this.height = height

    this.renderer.setSize(this.width, this.height)
    this.camera.right = this.width
    this.camera.bottom = this.height
    this.camera.updateProjectionMatrix()
    this.renderer.render(this.scene, this.camera)
  }

  public getCanvasElement (): HTMLCanvasElement {
    return this.rendererCanvasElement
  }

  public destroy (): void {
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
