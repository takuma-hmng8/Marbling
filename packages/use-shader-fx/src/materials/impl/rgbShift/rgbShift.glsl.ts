import { ShaderLib } from "../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `
	
	// uniform sampler2D src;
	uniform vec2 shiftPower;
	
	uniform sampler2D shiftPowerSrcR;
	uniform bool isUseShiftPowerSrcR;
	uniform sampler2D shiftPowerSrcG;
	uniform bool isUseShiftPowerSrcG;
	uniform sampler2D shiftPowerSrcB;
	uniform bool isUseShiftPowerSrcB;
	uniform float shiftScale;	

	void main() {
		vec2 usf_Uv = gl_FragCoord.xy;

		${ShaderLib.basicFx_fragment_begin}

		vec2 shift = shiftPower * shiftScale;
		vec2 uv = vTextureCoverUv;		

		float r = 0.0;
		if(isUseShiftPowerSrcR){		
			vec2 shiftR = (texture2D(shiftPowerSrcR, uv).rg * 4.0 - 1.0) * shiftScale;
			r = texture2D(texture_src, uv + shiftR).r;
		} else {
		 	r = texture2D(texture_src, uv + shift).r;
		}

		float g = 0.0;
		if(isUseShiftPowerSrcG){
			vec2 shiftG = (texture2D(shiftPowerSrcG, uv).rg * 4.0 - 1.0) * shiftScale;
			g = texture2D(texture_src, uv + shiftG).g;
		} else {
			g = texture2D(texture_src, uv + shift).g;
		}

		float b = 0.0;
		if(isUseShiftPowerSrcB){
			vec2 shiftB = (texture2D(shiftPowerSrcB, uv).rg * 4.0 - 1.0) * shiftScale;
			b = texture2D(texture_src, uv + shiftB).b;
		} else {
			b = texture2D(texture_src, uv + shift).b;
		}


		vec4 outColor = vec4(r, g, b, 1.0);

		vec4 usf_FragColor = outColor;

		${ShaderLib.basicFx_fragment_end}

		gl_FragColor = outColor;

	}
`;
