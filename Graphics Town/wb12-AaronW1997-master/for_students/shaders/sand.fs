varying vec3 v_normal;

const vec3 lightDir = vec3(0,0,1);
const vec3 baseColor = vec3(1,.8,.4);

uniform sampler2D colormap;
varying vec2 v_uv;

void main()
{
    //for texture
    vec4 lookupColor = texture2D(colormap,v_uv);

    //for lighting
    vec3 nhat = normalize(v_normal);
    float light = abs(dot(nhat, lightDir));

    // brighten the base color
    gl_FragColor = vec4(light * lookupColor);
}