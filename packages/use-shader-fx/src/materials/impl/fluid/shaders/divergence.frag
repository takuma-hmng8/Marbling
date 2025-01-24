uniform float dt;
uniform sampler2D velocity;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){
    float L = texture2D(velocity, vL).r;
    float R = texture2D(velocity, vR).r;
    float B = texture2D(velocity, vB).g;
    float T = texture2D(velocity, vT).g;
	 
    float divergence = (R-L + T-B) / 2.0;
    gl_FragColor = vec4(divergence / dt);
}
