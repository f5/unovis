// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MaplibreGLLayer (leaflet, maplibre, options) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Layer = leaflet.Layer.extend({
    options: {
      updateInterval: 32,
      // How much to extend the overlay view (relative to map size)
      // e.g. 0.1 would be 10% of map view in each direction
      padding: 0.1,
      // whether or not to register the mouse and keyboard
      // events on the maplibre overlay
      interactive: false,
      // set the tilepane as the default pane to draw gl tiles
      pane: 'tilePane',
    },

    initialize: function (options) {
      leaflet.setOptions(this, options)

      // setup throttling the update event when panning
      this._throttledUpdate = leaflet.Util.throttle(this._update, this.options.updateInterval, this)
    },

    onAdd: function (map) {
      if (!this._container) {
        this._initContainer()
      }

      const paneName = this.getPaneName()
      map.getPane(paneName).appendChild(this._container)

      this._initGL()

      this._offset = this._map.containerPointToLayerPoint([0, 0])

      // work around https://github.com/mapbox/mapbox-gl-leaflet/issues/47
      if (map.options.zoomAnimation) {
        leaflet.DomEvent.on(map._proxy, leaflet.DomUtil.TRANSITION_END, this._transitionEnd, this)
      }
    },

    onRemove: function (map) {
      if (this._map._proxy && this._map.options.zoomAnimation) {
        leaflet.DomEvent.off(this._map._proxy, leaflet.DomUtil.TRANSITION_END, this._transitionEnd, this)
      }
      const paneName = this.getPaneName()
      map.getPane(paneName).removeChild(this._container)

      this._glMap.remove()
      this._glMap = null
    },

    getEvents: function () {
      return {
        move: this._throttledUpdate, // sensibly throttle updating while panning
        zoomanim: this._animateZoom, // applys the zoom animation to the <canvas>
        zoom: this._pinchZoom, // animate every zoom event for smoother pinch-zooming
        zoomstart: this._zoomStart, // flag starting a zoom to disable panning
        zoomend: this._zoomEnd,
        resize: this._resize,
      }
    },

    getMaplibreMap: function () {
      return this._glMap
    },

    getCanvas: function () {
      return this._glMap.getCanvas()
    },

    getSize: function () {
      return this._map.getSize().multiplyBy(1 + this.options.padding * 2)
    },

    getBounds: function () {
      const halfSize = this.getSize().multiplyBy(0.5)
      const center = this._map.latLngToContainerPoint(this._map.getCenter())
      return leaflet.latLngBounds(
        this._map.containerPointToLatLng(center.subtract(halfSize)),
        this._map.containerPointToLatLng(center.add(halfSize))
      )
    },

    getContainer: function () {
      return this._container
    },

    // returns the pane name set in options if it is a valid pane, defaults to tilePane
    getPaneName: function () {
      return this._map.getPane(this.options.pane) ? this.options.pane : 'tilePane'
    },

    _initContainer: function () {
      const container = this._container = leaflet.DomUtil.create('div', 'leaflet-gl-layer')

      const size = this.getSize()
      const offset = this._map.getSize().multiplyBy(this.options.padding)
      container.style.width = `${size.x}px`
      container.style.height = `${size.y}px`

      const topLeft = this._map.containerPointToLayerPoint([0, 0]).subtract(offset)

      leaflet.DomUtil.setPosition(container, topLeft)
    },

    _initGL: function () {
      const center = this._map.getCenter()

      const options = leaflet.extend({}, this.options, {
        container: this._container,
        center: [center.lng, center.lat],
        zoom: this._map.getZoom() - 1,
        attributionControl: false,
      })

      this._glMap = new maplibre.Map(options)

      // allow GL base map to pan beyond min/max latitudes
      this._glMap.transform.latRange = null
      this._glMap.transform.maxValidLatitude = Infinity

      this._transformGL(this._glMap)

      if (this._glMap._canvas.canvas) {
        // older versions of mapbox-gl surfaced the canvas differently
        this._glMap._actualCanvas = this._glMap._canvas.canvas
      } else {
        this._glMap._actualCanvas = this._glMap._canvas
      }

      // treat child <canvas> element like leaflet.ImageOverlay
      const canvas = this._glMap._actualCanvas
      leaflet.DomUtil.addClass(canvas, 'leaflet-image-layer')
      leaflet.DomUtil.addClass(canvas, 'leaflet-zoom-animated')
      if (this.options.interactive) {
        leaflet.DomUtil.addClass(canvas, 'leaflet-interactive')
      }
      if (this.options.className) {
        leaflet.DomUtil.addClass(canvas, this.options.className)
      }
    },

    _update: function (e) {
      // update the offset so we can correct for it later when we zoom
      this._offset = this._map.containerPointToLayerPoint([0, 0])

      if (this._zooming) {
        return
      }

      const size = this.getSize()
      const container = this._container
      const gl = this._glMap
      const offset = this._map.getSize().multiplyBy(this.options.padding)
      const topLeft = this._map.containerPointToLayerPoint([0, 0]).subtract(offset)

      leaflet.DomUtil.setPosition(container, topLeft)

      this._transformGL(gl)

      if (gl.transform.width !== size.x || gl.transform.height !== size.y) {
        container.style.width = `${size.x}px`
        container.style.height = `${size.y}px`
        if (gl._resize !== null && gl._resize !== undefined) {
          gl._resize()
        } else {
          gl.resize()
        }
      } else {
        // older versions of mapbox-gl surfaced update publicly
        if (gl._update !== null && gl._update !== undefined) {
          gl._update()
        } else {
          gl.update()
        }
      }
    },

    _transformGL: function (gl) {
      const center = this._map.getCenter()

      // gl.setView([center.lat, center.lng], this._map.getZoom() - 1, 0);
      // calling setView directly causes sync issues because it uses requestAnimFrame

      const tr = gl.transform
      tr.center = maplibre.LngLat.convert([center.lng, center.lat])
      tr.zoom = this._map.getZoom() - 1
    },

    // update the map constantly during a pinch zoom
    _pinchZoom: function (e) {
      this._glMap.jumpTo({
        zoom: this._map.getZoom() - 1,
        center: this._map.getCenter(),
      })
    },

    // borrowed from leaflet.ImageOverlay
    // https://github.com/Leaflet/Leaflet/blob/master/src/layer/ImageOverlay.js#L139-L144
    _animateZoom: function (e) {
      const scale = this._map.getZoomScale(e.zoom)
      const padding = this._map.getSize().multiplyBy(this.options.padding * scale)
      const viewHalf = this.getSize()._divideBy(2)
      // corrections for padding (scaled), adapted from
      // https://github.com/Leaflet/Leaflet/blob/master/src/map/Map.js#L1490-L1508
      const topLeft = this._map.project(e.center, e.zoom)
        ._subtract(viewHalf)
        ._add(this._map._getMapPanePos()
          .add(padding))._round()
      const offset = this._map.project(this._map.getBounds().getNorthWest(), e.zoom)
        ._subtract(topLeft)

      leaflet.DomUtil.setTransform(
        this._glMap._actualCanvas,
        offset.subtract(this._offset),
        scale
      )
    },

    _zoomStart: function (e) {
      this._zooming = true
    },

    _zoomEnd: function () {
      const scale = this._map.getZoomScale(this._map.getZoom())

      leaflet.DomUtil.setTransform(
        this._glMap._actualCanvas,
        // https://github.com/mapbox/mapbox-gl-leaflet/pull/130
        null,
        scale
      )

      this._zooming = false

      this._update()
    },

    _transitionEnd: function (e) {
      leaflet.Util.requestAnimFrame(function () {
        const zoom = this._map.getZoom()
        const center = this._map.getCenter()
        const offset = this._map.latLngToContainerPoint(
          this._map.getBounds().getNorthWest()
        )

        // reset the scale and offset
        leaflet.DomUtil.setTransform(this._glMap._actualCanvas, offset, 1)

        // enable panning once the gl map is ready again
        this._glMap.once('moveend', leaflet.Util.bind(function () {
          this._zoomEnd()
        }, this))

        // update the map position
        this._glMap.jumpTo({
          center: center,
          zoom: zoom - 1,
        })
      }, this)
    },

    _resize: function (e) {
      this._transitionEnd(e)
    },
  })

  return new Layer(options)
}

