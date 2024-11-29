"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useFluid,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl({
   uniforms: {
      mask: { value: null },
   },
   fragmentShader: `
	uniform sampler2D src;
	uniform sampler2D mask;
	void main() {
		vec2 vel = texture2D(src, vUv).xy;
		float len = length(vel);
		vel = vel * 0.5 + 0.5;
		
		vec3 color = vec3(vel.x, vel.y, 1.0);
		color = mix(vec3(1.0), color, len);

		// fluid カラー
		vec4 fluidColor = vec4(color, 1.0);

		// マスク
		vec4 maskColor = texture2D(mask, vUv);

		// チャンネル α
		vec4 outPut = fluidColor * maskColor.a;

		// チャンネル r
		// vec4 outPut = fluidColor * maskColor.r;

		// チャンネル g
		// vec4 outPut = fluidColor * maskColor.g;

		// チャンネル b
		// vec4 outPut = fluidColor * maskColor.b;


		gl_FragColor = outPut;
	}
`,
});

extend({ MaskMaterialImpl: FxMaterialImpl });

/*===============================================
Idea of Mask in BasicFx
- figmaみたいにmaskをかけることができる
- チャンネルを選択できる[ α | r | g | b ]
===============================================*/

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [colorMask, alphaMask] = useTexture(["/mask.jpg", "/mask.png"]);

   const fluid = useFluid({
      size,
      dpr: 0.5,
   });

   useFrame((state) => {
      fluid.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <maskMaterialImpl
            key={FxMaterialImpl.key}
            src={fluid.texture}
            mask={alphaMask}
         />
      </mesh>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         maskMaterialImpl: {
            mask: THREE.Texture | null;
         } & FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
