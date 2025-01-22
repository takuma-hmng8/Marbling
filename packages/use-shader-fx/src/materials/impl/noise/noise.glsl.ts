import { ShaderLib } from "../../../shaders/ShaderLib";

export const noiseVertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const noiseFragment = `
	precision highp int;

	uniform float tick;
	uniform float timeStrength;
	uniform int noiseOctaves;
	uniform int fbmOctaves;
	uniform int warpOctaves;
	uniform vec2 warpDirection;
	uniform float warpStrength;
	uniform float scale;
	uniform float timeOffset;

	const float per  = 0.5;
	const float PI   = 3.14159265359;

	float rnd(vec2 n) {
		float a = 0.129898;
		float b = 0.78233;
		float c = 437.585453;
		float dt= dot(n ,vec2(a, b));
		float sn= mod(dt, PI);
		return fract(sin(sn) * c);
	}

	float interpolate(float a, float b, float x){
		float f = (1.0 - cos(x * PI)) * 0.5;
		return a * (1.0 - f) + b * f;
	}

	float irnd(vec2 p){
		vec2 i = floor(p);
		vec2 f = fract(p);
		vec4 v = vec4(rnd(vec2(i.x,i.y)),rnd(vec2(i.x + 1.0,i.y)),rnd(vec2(i.x,i.y + 1.0)),rnd(vec2(i.x + 1.0, i.y + 1.0)));
		return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
	}

	// Based on The Book of Shaders
	// https://thebookofshaders.com/13/
	float noise(vec2 p, float time){
		float _time = time + timeOffset;
		float t = 0.0;
		for(int i = 0; i < noiseOctaves; i++){
			float freq = pow(2.0, float(i));
			float amp  = pow(per, float(noiseOctaves - i));
			t += irnd(vec2(p.y / freq + _time, p.x / freq + _time)) * amp;
		}
		return t;
	}

	float fbm(vec2 x, float time) {
		float v = 0.0;
		float a = 0.5;
		vec2 shift = vec2(100);
		mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
		float sign = 1.0;
		for (int i = 0; i < fbmOctaves; ++i) {
			v += a * noise(x, time * sign);
			x = rot * x * 2.0 + shift;
			a *= 0.5;
			sign *= -1.0;
		}
		return v;
	}

	float warp(vec2 x, float g,float time){
		float val = 0.0;
		for (int i = 0; i < warpOctaves; i++){
			val = fbm(x + g * vec2(cos(warpDirection.x * val), sin(warpDirection.y * val)), time);
		}
		return val;
	}

	void main() {

		vec2 usf_Uv = gl_FragCoord.xy;

		${ShaderLib.basicFx_fragment_begin}

		float noise = warp(usf_Uv * scale ,warpStrength,tick * timeStrength);
		vec4 noiseColor = vec4(vec3(noise),1.0);

		vec4 usf_FragColor = noiseColor;

		${ShaderLib.basicFx_fragment_end}
		
		gl_FragColor = usf_FragColor;

	}
`;
