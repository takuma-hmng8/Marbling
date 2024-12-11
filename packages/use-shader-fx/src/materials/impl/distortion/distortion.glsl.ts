import { ShaderLib } from "../../../shaders/ShaderLib";

export const vertex = `
	void main() {
		${ShaderLib.plane_vertex}
	}
`;

export const fragment = `		
	uniform float time;
	uniform vec2 scale;
	uniform vec2 freq;
	uniform vec2 timeStrength;
	uniform float timeOffset;
	uniform vec2 powNum;

	
	uniform float glitchSpeed;
	uniform float glitchPower;
	uniform vec2 glitchFreq;	
	uniform float glitchThreshold;


	// noise functions
	//
	// Description : Array and textureless GLSL 2D/3D/4D simplex
	//               noise functions.
	//      Author : Ian McEwan, Ashima Arts.
	//  Maintainer : ijm
	//     Lastmod : 20110822 (ijm)
	//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
	//               Distributed under the MIT License. See LICENSE file.
	//               https://github.com/ashima/webgl-noise
	//

	vec3 mod289(vec3 x) {
		return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	vec4 mod289(vec4 x) {
		return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	vec4 permute(vec4 x) {
		return mod289(((x*34.0)+1.0)*x);
	}

	vec4 taylorInvSqrt(vec4 r)
	{
	return 1.79284291400159 - 0.85373472095314 * r;
	}

	float snoise(vec3 v) {
		const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
		const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

		// First corner
		vec3 i  = floor(v + dot(v, C.yyy) );
		vec3 x0 =   v - i + dot(i, C.xxx) ;

		// Other corners
		vec3 g = step(x0.yzx, x0.xyz);
		vec3 l = 1.0 - g;
		vec3 i1 = min( g.xyz, l.zxy );
		vec3 i2 = max( g.xyz, l.zxy );

		//   x0 = x0 - 0.0 + 0.0 * C.xxx;
		//   x1 = x0 - i1  + 1.0 * C.xxx;
		//   x2 = x0 - i2  + 2.0 * C.xxx;
		//   x3 = x0 - 1.0 + 3.0 * C.xxx;
		vec3 x1 = x0 - i1 + C.xxx;
		vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
		vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

		// Permutations
		i = mod289(i);
		vec4 p = permute( permute( permute(
					i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
				+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
				+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

		// Gradients: 7x7 points over a square, mapped onto an octahedron.
		// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
		float n_ = 0.142857142857; // 1.0/7.0
		vec3  ns = n_ * D.wyz - D.xzx;

		vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

		vec4 x_ = floor(j * ns.z);
		vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

		vec4 x = x_ *ns.x + ns.yyyy;
		vec4 y = y_ *ns.x + ns.yyyy;
		vec4 h = 1.0 - abs(x) - abs(y);

		vec4 b0 = vec4( x.xy, y.xy );
		vec4 b1 = vec4( x.zw, y.zw );

		//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
		//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
		vec4 s0 = floor(b0)*2.0 + 1.0;
		vec4 s1 = floor(b1)*2.0 + 1.0;
		vec4 sh = -step(h, vec4(0.0));

		vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
		vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

		vec3 p0 = vec3(a0.xy,h.x);
		vec3 p1 = vec3(a0.zw,h.y);
		vec3 p2 = vec3(a1.xy,h.z);
		vec3 p3 = vec3(a1.zw,h.w);

		//Normalise gradients
		vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;

		// Mix final noise value
		vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
		m = m * m;
		return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
		dot(p2,x2), dot(p3,x3) ) );
	}	
	// end noise functions

	void main() {

		float _time = time + timeOffset;
		vec2 _scale = scale * 0.01;
				
		vec2 shiftUv = vUv;

		shiftUv.x =
			snoise(
				vec3(
					vUv.y * freq.y,
					vUv.x + time * timeStrength.x,
					_time * timeStrength.x + 20.
				)
			) * _scale.x;

		shiftUv.y =
			snoise(
				vec3(
					vUv.x * freq.x,
					vUv.y + time * timeStrength.y + 10.,		
					_time * timeStrength.y
				)
			) * _scale.y;

		// 符号を保ったままpowを計算
		shiftUv = sign(shiftUv) * pow(abs(shiftUv), powNum);

		vec2 dUv = vUv + shiftUv;
		vec4 outColor = texture2D(texture_src, dUv);


		if(glitchPower > 0.0) {
			
			float cTime1 = ceil(time * 10. * glitchSpeed);
			float cTime2 = ceil(time * 7. * glitchSpeed) + 13.;			
			
			float gnx = (snoise(vec3(
				floor(vUv.x * glitchFreq.x) / glitchFreq.x,
				cTime2,
				vUv.x * glitchFreq.x
			)) + 1.0) * 0.5;

			float gny = (snoise(vec3(
				floor(vUv.y * glitchFreq.y) / glitchFreq.y,
				cTime2,
				floor(vUv.y * glitchFreq.y)
			)) + 1.0) * 0.5;
			
			float gn = (snoise(vec3(	
				cTime1,				
				floor(vUv.x * glitchFreq.x) / glitchFreq.x * gnx,
				floor(vUv.y * glitchFreq.y) / glitchFreq.y * gny
			)) + 1.0) * 0.5;

			vec2 d2Uv = dUv;
			if(gn < glitchThreshold) {				
				d2Uv += vec2(
					snoise(vec3(dUv.x + cTime2, vUv.y, cTime2 + gny)),
					snoise(vec3(dUv.y + cTime1, vUv.x, cTime1 + gnx))
				) * glitchPower * vec2(0.01);
				outColor = texture2D(texture_src, d2Uv);										
			}
		}


		gl_FragColor = outColor;		
	}
`;
