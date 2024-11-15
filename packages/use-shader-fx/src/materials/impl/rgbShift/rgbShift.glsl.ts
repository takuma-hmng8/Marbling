import { ShaderLib } from "../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `
	
	uniform sampler2D src;
	uniform vec2 shiftPower;

	// TODO: add texture for each channel

	void main() {
		
		vec2 shift = shiftPower * 0.01;
		vec4 r = texture2D(src, vUv + shift);
		vec4 g = texture2D(src, vUv);
		vec4 b = texture2D(src, vUv - shift);
		vec4 outColor = vec4(r.r, g.g, b.b, 1.0);
	
		gl_FragColor = outColor;

	}
`;
