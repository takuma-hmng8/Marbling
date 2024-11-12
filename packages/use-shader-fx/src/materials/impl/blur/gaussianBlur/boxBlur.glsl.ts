import { ShaderLib } from "../../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `	
	uniform sampler2D src;		
	uniform vec2 u_step;	
	uniform vec2 u_stepSize;	
	uniform vec2 sigma;	
	uniform float u_weights[KERNEL_SIZE];	

	void main() {

		float count =  float(KERNEL_SIZE) - 1.0;		

		vec4 color = vec4(0.0);
		vec4 sum = vec4(0.0);
		float w;
		float sumW = 0.0;
		float actualWeight;
		vec2 stepSize = u_stepSize * sigma;

		for(int i = 0; i <  KERNEL_SIZE - 1; i++){

			w = u_weights[i];
			color = texture2D( src, vUv - count * u_step * stepSize );
			actualWeight = w * color.a;
			sum.rgb += color.rgb * actualWeight;
			sum.a += color.a * w;
			sumW += actualWeight;

			color = texture2D( src, vUv + count * u_step * stepSize );
			actualWeight = w * color.a;
			sum.rgb += color.rgb * actualWeight;
			sum.a += color.a * w;
			sumW += actualWeight;

			count--;
		}

		w = u_weights[KERNEL_SIZE - 1];

		color = texture2D( src, vUv );
		actualWeight = w * color.a;
		sum.rgb += color.rgb * actualWeight;
		sum.a += color.a * w;
		sumW += actualWeight;

		gl_FragColor = vec4(sum.rgb / sumW, sum.a);
	}
`;
