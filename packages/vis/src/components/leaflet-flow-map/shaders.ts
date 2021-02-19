// Copyright (c) Volterra, Inc. All rights reserved.
export const vertex = `
attribute float size;
attribute vec4 customColor;
varying vec4 vColor;
void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * 2.0;
    gl_Position = projectionMatrix * mvPosition;
}
`
export const fragment = `
uniform vec3 color;
varying vec4 vColor;
void main() {
    // if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
    // gl_FragColor = vec4(color * vColor.rgb,  vColor.a);
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);

    float opacity = 1.0 - smoothstep(0.7, 1.0, r);
    gl_FragColor = vec4(color * vColor.rgb,  vColor.a * opacity);
}
`
