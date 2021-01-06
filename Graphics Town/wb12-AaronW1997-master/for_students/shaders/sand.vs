varying vec2 v_uv;
uniform sampler2D colormap;
uniform float theta;

varying vec3 v_normal;

void main()
{
    float height = texture2D(colormap, uv).g;

    vec3 pos = position + height*normal * theta;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    v_uv = uv;
    v_normal = normalMatrix * normal;
}