import { ShaderLib } from "../../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `		
	uniform sampler2D src;			
	uniform sampler2D backBuffer;
	uniform float mixRatio;

	void main() {				
		vec4 color = texture2D(src, vUv);
		vec4 prevColor = texture2D(backBuffer, vUv);

		gl_FragColor = mix(prevColor, color, mixRatio);
	}
`;
