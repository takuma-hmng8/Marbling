const boxVarying = `
	uniform bool isBounce;
	varying vec2 vL;
	varying vec2 vR;
	varying vec2 vT;
	varying vec2 vB;
`;

const getPosition = (isBounce: boolean = true) => {
   return `
		vec3 pos = position;
		vec2 scale = ${
         isBounce
            ? "isBounce ? vec2(1.,1.) : 1.-texelSize*2."
            : "1.-texelSize*2."
      };
		pos.xy = pos.xy * scale;
		vUv = vec2(.5)+(pos.xy)*.5;
	`;
};

const getBoxCompute = (diff: string) => {
   return `
		vL = vUv - vec2(texelSize.x * ${diff}, 0.0);
		vR = vUv + vec2(texelSize.x * ${diff}, 0.0);
		vT = vUv + vec2(0.0, texelSize.y * ${diff});
		vB = vUv - vec2(0.0, texelSize.y * ${diff});
	`;
};

const vertex = {
   main: `
		${boxVarying}

		void main(){
		
			${getPosition()}
			${getBoxCompute("1.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
   poisson: `
		${boxVarying}
		
		void main(){

			${getPosition()}
			${getBoxCompute("2.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
   advection: `
		void main(){
			${getPosition(false)}
			gl_Position = vec4(pos, 1.0);
		}
	`,
   splat: `
		uniform vec2 center;
		uniform vec2 scale;
		void main(){		
			vec2 pos = position.xy * scale * 2.0 * texelSize + center;
			gl_Position = vec4(pos, 0.0, 1.0);
		}
	`,
};

export default vertex;
