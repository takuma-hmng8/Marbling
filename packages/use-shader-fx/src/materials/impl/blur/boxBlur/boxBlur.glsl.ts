import { ShaderLib } from "../../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `
	uniform float blurSize;

	void main() {

		${ShaderLib.samplingFx_fragment_begin}

		vec2 perDivSize = blurSize / resolution;
		vec2 uv = (renderCount == 0) ? vTextureCoverUv : vUv;

		
		vec4 outColor = vec4(
			texture2D(texture_src, uv + perDivSize * vec2(-1.0, -1.0)) +
			texture2D(texture_src, uv + perDivSize * vec2(0.0, -1.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(1.0, -1.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(-1.0, 0.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(0.0,  0.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(1.0,  0.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(-1.0, 1.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(0.0,  1.0)) + 
			texture2D(texture_src, uv + perDivSize * vec2(1.0,  1.0))
			) / 9.0;

		vec4 usf_FragColor = outColor;

		${ShaderLib.samplingFx_fragment_end}

		gl_FragColor = usf_FragColor;				
	}
`;
