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
	// uniform sampler2D shiftPowerSrc;
	// uniform sampler2D shiftPowerSrcR;
	// uniform sampler2D shiftPowerSrcG;
	// uniform sampler2D shiftPowerSrcB;	

	void main() {	
		vec2 shift = shiftPower * 0.01;

		// shift.x = texture2D(shiftPowerSrc, vUv).r * 2.0 - 1.0;
		// shift.y = texture2D(shiftPowerSrc, vUv).g * 2.0 - 1.0;
		// shift = shift * 0.1;

		vec4 r = texture2D(src, vUv + shift);
		vec4 g = texture2D(src, vUv);
		vec4 b = texture2D(src, vUv - shift);
		vec4 outColor = vec4(r.r, g.g, b.b, 1.0);
	
		gl_FragColor = outColor;

	}
`;
