import { ShaderLib } from "../../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `			
	uniform sampler2D backBuffer;
	uniform float mixRatio;

	void main() {				
		${ShaderLib.samplingFx_fragment_begin}

		vec4 currentColor = texture2D(texture_src, vTextureCoverUv);
		vec4 prevColor = texture2D(backBuffer, vTextureCoverUv);

		vec4 usf_FragColor = mix(prevColor, currentColor, mixRatio);

		${ShaderLib.samplingFx_fragment_end}

		gl_FragColor = usf_FragColor;
	}
`;
