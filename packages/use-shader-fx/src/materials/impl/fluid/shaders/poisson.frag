uniform sampler2D pressure;
uniform sampler2D divergence;

varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main(){    

	float L = texture2D(pressure, vL).r;
	float R = texture2D(pressure, vR).r;
	float B = texture2D(pressure, vB).r;
	float T = texture2D(pressure, vT).r;

	float div = texture2D(divergence, vUv).r;
	
	float newP = (L + R + B + T) / 4.0 - div;

	gl_FragColor = vec4(newP);
}
