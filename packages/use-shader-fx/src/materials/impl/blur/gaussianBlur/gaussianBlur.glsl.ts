import { ShaderLib } from "../../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `		
	precision highp int;

	// uniform sampler2D src;			
	uniform vec2 u_stepSize;	
	uniform vec2 sigma;	
	uniform float u_weights[KERNEL_SIZE];	

	void main() {

		${ShaderLib.basicFx_fragment_begin}

		float count =  float(KERNEL_SIZE) - 1.0;		

		vec4 color = vec4(0.0);
		vec4 sum = vec4(0.0);
		float w;
		float sumW = 0.0;
		float actualWeight;
		vec2 stepSize = u_stepSize * sigma;
		
		vec2 uv = (renderCount == 0) ? vTextureCoverUv : vUv;		
		
		for(int i = 0; i <  KERNEL_SIZE - 1; i++){

			w = u_weights[i];			
			color = texture2D( texture_src, uv - count * texelSize * stepSize );
			actualWeight = w * color.a;
			sum.rgb += color.rgb * actualWeight;
			sum.a += color.a * w;
			sumW += actualWeight;

			color = texture2D( texture_src, uv + count * texelSize * stepSize );
			actualWeight = w * color.a;
			sum.rgb += color.rgb * actualWeight;
			sum.a += color.a * w;
			sumW += actualWeight;

			count--;
		}

		w = u_weights[KERNEL_SIZE - 1];

		color = texture2D( texture_src, uv );
		actualWeight = w * color.a;
		sum.rgb += color.rgb * actualWeight;
		sum.a += color.a * w;
		sumW += actualWeight;

		vec4 usf_FragColor = vec4(sum.rgb / sumW, sum.a);

		${ShaderLib.basicFx_fragment_end}
		
		gl_FragColor = usf_FragColor;
	}
`;
