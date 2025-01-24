uniform float dt;
uniform sampler2D pressure;
uniform sampler2D velocity;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){

	float L = texture2D(pressure, vL).r;
	float R = texture2D(pressure, vR).r;
	float B = texture2D(pressure, vB).r;
	float T = texture2D(pressure, vT).r;

	vec2 v = texture2D(velocity, vUv).xy;
	vec2 gradP = vec2(R - L, T - B) * 0.5;
	v = v - gradP * dt;

	gl_FragColor = vec4(v, 0.0, 1.0);

}