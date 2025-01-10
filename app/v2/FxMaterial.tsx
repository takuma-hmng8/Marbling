import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterial: any;
      }
   }
}

export type FxMaterialProps = {
   u_blur: THREE.Texture;
   u_gooey: THREE.Texture;
   u_model: THREE.Texture;
   u_noise?: THREE.Texture;
   u_color0?: THREE.Color;
   u_color1?: THREE.Color;
};

export const FxMaterial = shaderMaterial(
   {
      u_blur: new THREE.Texture(),
      u_gooey: new THREE.Texture(),
      u_model: new THREE.Texture(),
      u_noise: new THREE.Texture(),
      u_fluid: new THREE.Texture(),
      u_color0: new THREE.Color(0xfa1bb1),
      u_color1: new THREE.Color(0x4a96ec),
   },

   `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`,
   `
		precision highp float;
		varying vec2 vUv;
		uniform sampler2D u_blur;
		uniform sampler2D u_gooey;
		uniform sampler2D u_model;
		uniform sampler2D u_noise;
		uniform sampler2D u_fluid;
		uniform vec3 u_color0;
		uniform vec3 u_color1;

		float rand(vec2 n) { 
			return fract(sin(dot(n ,vec2(12.9898,78.233))) * 43758.5453);
		}

		//// params ////
		
		// グラデーション
		float gradationColorFactor = 0.5; // color0に寄せるか、color1に寄せるか
		float gradationGrainIntensity = -.02; // グラデーションに適用する粒子ノイズの強さ

		// ブラー
		float blurGrainIntensity = -0.16; // ブラーに加算する粒子ノイズの強さ
		float blurGradationIntensity = 2.4; // ブラーに加算するグラデーションカラーの加算強度
		
		// ビネット
		float vignetteStrength = .9; // 強度（0.0〜1.0）
		float vignetteRadius = 0.5;  // 効果が始まる半径（0.0〜1.0）
		
		// グーイ
		float gooeyAlphaContrast = 80.0;
		float gooeyAlphaOffset = -20.0;
		vec2 gooeyNoisePosition = vec2(0.3, 0.3);
		vec2 gooeyNoiseIntensity = vec2(0.4, 0.4);

		// 流体
		float fluidIntensity = 0.08;

		void main() {
			vec2 uv = vUv;
			float grain = rand(uv); // 0〜1

			// 流体
			vec4 fluid = texture2D(u_fluid, uv);
			vec2 fluidUv = uv - fluid.rg * fluidIntensity;

			// グラデーション
			vec4 noise = texture2D(u_noise, fluidUv);
			vec3 gradationColor = mix(u_color0, u_color1, length(noise.rg * fluidUv) + gradationColorFactor);
			gradationColor += grain * gradationGrainIntensity;

			// ブラー
			vec4 blurColor = texture2D(u_blur,fluidUv);
			blurColor.rgb += grain * blurGrainIntensity;
			blurColor.rgb += gradationColor * blurGradationIntensity;

			// ブラーとノイズを混ぜる		
			vec3 mixedBlurColor = mix(gradationColor, blurColor.rgb, blurColor.r);
			
			// モデル
			vec4 modelColor = texture2D(u_model,uv);
			float gooeyAlpha = texture2D(u_gooey,uv).r;
			vec3 mixedModelColor = mix(mixedBlurColor, vec3(0.), clamp(gooeyAlpha * gooeyAlphaContrast + gooeyAlphaOffset, 0., 1.));

			// ビネット
			vec2 position = fluidUv - .5;

			position.x += (noise.g - gooeyNoisePosition.x) * gooeyNoiseIntensity.x;
			position.y += (noise.g - gooeyNoisePosition.y) * gooeyNoiseIntensity.y;

			float distance = length(position);
			float vignette = smoothstep(vignetteRadius, vignetteRadius - 0.5, distance);
			vignette = mix(1.0, vignette, vignetteStrength);

			vec3 finalColor = mixedModelColor * vignette;
	
			// アウトプット
			gl_FragColor = vec4(finalColor, 1.);

		
		}
	`
);
