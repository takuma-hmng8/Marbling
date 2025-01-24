"use client";

import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   useNoise,
   NoiseValues,
   useSingleFBO,
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useFluid,
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
		fluidColor.r *= clamp(fluidColor.r * 1., 0., 1.);
		fluidColor.g *= clamp(fluidColor.g * 0.6, 0., 1.);
		fluidColor.b *= clamp(fluidColor.b * .6, 0., 1.);
		// THINK ここまでがデフォルトのfluidのcolor
		
		// THINK ここからがbasicFxの色調補正
		// THINK ガンマ補正とコントラストはvec4でやればいいのかも

		vec4 outputColor = fluidColor;

		/*===============================================
		COLOR ADJUSTMENTS
		===============================================*/
		
		/*===============================================
		// レベル補正 Levels		vec4 に意味がありそう
		===============================================*/
 		// vec4のテスト
		vec4 u_shadows = vec4(0., 0., 0., 0.); // シャドウ値
		vec4 u_midtones = vec4(1., 1., 1., .5); // ミッドトーン値
		vec4 u_highlights = vec4(1., 1., 1., 1.); // ハイライト値
		vec4 u_outputMin = vec4(0., 0., 0., 0.); // 出力の最小値
		vec4 u_outputMax = vec4(1., 1., 1., 1.); // 出力の最大値

		// 入力レベル補正
		outputColor = (outputColor - vec4(u_shadows)) / (vec4(u_highlights) - vec4(u_shadows));

		// ガンマ補正
		outputColor = pow(outputColor, vec4(1.0 / u_midtones));

		// 出力レベル補正
		outputColor = outputColor * (vec4(u_outputMax) - vec4(u_outputMin)) + vec4(u_outputMin);

		/*===============================================
		// コントラスト Contrast TODO これもvec4でuniformを渡す！ alphaだけコントラストかけたり！
		===============================================*/
		// コントラスト
		vec4 contrastFactor = vec4(1.,1.,1.,1.);
		outputColor = clamp(((outputColor-.5)*contrastFactor)+.5, 0., 1.);

		/*===============================================
		// ColorBalance
		===============================================*/
		vec3 colorBalance = vec3(2., .2, 12.2);
		// outputColor.rgb = clamp(outputColor.rgb * colorBalance, 0., 1.);

		/*===============================================
		// hsv
		===============================================*/
		float hueShift   = 0.10; // 色相を +X 度分回転 (0.0~1.0 で0~360度)
		float saturation = 2.0; // 彩度乗算 (1.0で変化なし)
		float brightness = 2.0; // 明度乗算 (1.0で変化なし)

		vec3 hsv = rgb2hsv(outputColor.rgb);

		hsv.x = fract(hsv.x + hueShift); // Hue (色相) - 加算で回転、fract で 0~1 に収める
		hsv.y = clamp(hsv.y * saturation, 0.0, 1.0); // Saturation (彩度) - 乗算して 0~1 に clamp
		hsv.z = clamp(hsv.z * brightness, 0.0, 1.0); // brightness (明度) - 乗算して 0~1 に clamp

		outputColor.rgb = hsv2rgb(hsv);

		/*===============================================
		// ポスタライゼーション Posterize
		===============================================*/
		vec4 posterization = vec4(0.,1.,0.,1.); // 1以上
		outputColor.r = posterization.r > 1. ? floor(outputColor.r * posterization.r) / posterization.r : outputColor.r;
		outputColor.g = posterization.g > 1. ? floor(outputColor.g * posterization.g) / posterization.g : outputColor.g;
		outputColor.b = posterization.b > 1. ? floor(outputColor.b * posterization.b) / posterization.b : outputColor.b;
		outputColor.a = posterization.a > 1. ? floor(outputColor.a * posterization.a) / posterization.a : outputColor.a;

		/*===============================================
		// BlackAndWhite TODO * 以下の型
		grayscale = {
			weight:vector3;
			duotone:{
				color0:vector3;
				color1:vector3;
			};
			threashold:float; // 0~1 負の値は処理をスキップする
		}
		===============================================*/
		float redWeight = 0.4;
		float greenWeight = 2.;
		float blueWeight = 0.;
		float grayscale = dot(outputColor.rgb, vec3(0.299 + redWeight, 0.587 + greenWeight, 0.114 + blueWeight));

		// outputColor.rgb = vec3(grayscale);

		/*===============================================
		// DuoTone TODO ここからgrayscaleとしてまとめる？
		===============================================*/
		vec3 color0 = vec3(0.45, .5, 0.534);
		vec3 color1 = vec3(.3, 0.876, 0.579);
		// outputColor.rgb = mix(color0, color1, grayscale);

		/*===============================================
		// Threshold
		===============================================*/
		float threshold = 0.2;
		// outputColor.rgb = grayscale > threshold ? vec3(1.) : vec3(0.);

		
		/*===============================================
		ここまでが色調補正
		===============================================*/

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
