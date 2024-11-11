"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   NoiseValues,
   useBlur,
   useSingleFBO,
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useFluid,
   useCoverTexture,
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls, useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;

	vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

	void main() {
	
		vec4 fluid = texture2D(src, vUv);
		vec2 vel = fluid.rg;
		float len = length(vel); // 0~1
		vec4 fluidColor = vec4(len);

		// color balance
		fluidColor.r *= clamp(fluidColor.r * 1.1, 0., 1.);
		fluidColor.g *= clamp(fluidColor.g * 0.2, 0., 1.);
		fluidColor.b *= clamp(fluidColor.b * .6, 0., 1.);
		// THINK ここまでがデフォルトのfluidのcolor
		
		// THINK ここからがbasicFxの色調補正
		// THINK ガンマ補正とコントラストはvec4でやればいいのかも

		vec4 outputColor = fluidColor;
		
		/*===============================================
		// レベル補正
		===============================================*/
		float u_shadows = 1.2;         // シャドウ値 
		float u_midtones = 1.1;        // ミッドトーン値
		float u_highlights = 1.4;      // ハイライト値 
		float u_outputMin = 0.0;       // 出力の最小値 
		float u_outputMax = 1.0;       // 出力の最大値

		// 入力レベル補正
		outputColor = (outputColor - vec4(u_shadows)) / (vec4(u_highlights) - vec4(u_shadows));

		// ガンマ補正
		outputColor = pow(outputColor, vec4(1.0 / u_midtones));

		// 出力レベル補正
		outputColor = outputColor * (vec4(u_outputMax) - vec4(u_outputMin)) + vec4(u_outputMin);
		/*===============================================
		// コントラスト TODO これもvec4でuniformを渡す！ alphaだけコントラストかけたり！
		===============================================*/
		// コントラスト
		float contrastFactor = 20.;
		outputColor = clamp(((outputColor-.5)*contrastFactor)+.5, 0., 1.);

		/*===============================================
		// color balance
		===============================================*/
		outputColor.r *= clamp(outputColor.r * 1., 0., 1.);
		outputColor.g *= clamp(outputColor.g * 1., 0., 1.);
		outputColor.b *= clamp(outputColor.b * 1., 0., 1.);

		/*===============================================
		// saturation・brightness
		===============================================*/
		vec3 hsv = rgb2hsv(outputColor.rgb);
		hsv.y *= 1.; // 彩度
		hsv.z *= 2.; // 明度
		outputColor.rgb = hsv2rgb(hsv);

		/*===============================================
		// ポスタライゼーション
		===============================================*/
		float posterizationLevels = 6.;
		outputColor.rgb = floor(outputColor.rgb * posterizationLevels) / posterizationLevels;

		/*===============================================
		// black&White
		===============================================*/
		float redWeight = 0.;
		float greenWeight = 0.;
		float blueWeight = 0.;
		float grayscale = dot(outputColor.rgb, vec3(0.299 + redWeight, 0.587 + greenWeight, 0.114 + blueWeight));

		outputColor.rgb = vec3(grayscale);

		/*===============================================
		// duo tone
		===============================================*/
		vec3 color0 = vec3(0.45, .5, 0.534);
		vec3 color1 = vec3(.3, 0.876, 0.579);
		// outputColor.rgb = mix(color0, color1, grayscale);

		/*===============================================
		// threshold
		===============================================*/
		float threshold = 0.4;
		// outputColor.rgb = grayscale > threshold ? vec3(1.) : vec3(0.);

		// alpha TODO * transparentを選択できるようにする？
		float alpha = outputColor.a;
		// float alpha = 1.;
		gl_FragColor = vec4(outputColor.rgb, alpha);
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun] = useTexture(["/funkun.jpg"]);

   const fluid = useFluid({
      size,
      dpr: 0.6,
   });

   useFrame((state) => {
      fluid.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={fluid.texture} />
      </mesh>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
         BasicFxMaterialImpl: BasicFxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
