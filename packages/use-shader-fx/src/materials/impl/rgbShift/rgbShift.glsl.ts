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
	uniform sampler2D shiftPowerSrcR;
	uniform bool isUseShiftPowerSrcR;
	uniform sampler2D shiftPowerSrcG;
	uniform bool isUseShiftPowerSrcG;
	uniform sampler2D shiftPowerSrcB;
	uniform bool isUseShiftPowerSrcB;
	uniform float shiftScale;	

	void main() {
		vec2 shift = shiftPower * shiftScale;		

		float r = 0.0;
		if(isUseShiftPowerSrcR){		
			vec2 shiftR = (texture2D(shiftPowerSrcR, vUv).rg * 4.0 - 1.0) * shiftScale;
			r = texture2D(src, vUv + shiftR).r;
		} else {
		 	r = texture2D(src, vUv + shift).r;
		}

		float g = 0.0;
		if(isUseShiftPowerSrcG){
			vec2 shiftG = (texture2D(shiftPowerSrcG, vUv).rg * 4.0 - 1.0) * shiftScale;
			g = texture2D(src, vUv + shiftG).g;
		} else {
			g = texture2D(src, vUv + shift).g;
		}

		float b = 0.0;
		if(isUseShiftPowerSrcB){
			vec2 shiftB = (texture2D(shiftPowerSrcB, vUv).rg * 4.0 - 1.0) * shiftScale;
			b = texture2D(src, vUv + shiftB).b;
		} else {
			b = texture2D(src, vUv + shift).b;
		}


		vec4 outColor = vec4(r, g, b, 1.0);
		gl_FragColor = outColor;

	}
`;
