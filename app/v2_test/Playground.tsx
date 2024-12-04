"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls, useTexture } from "@react-three/drei";
import { useGaussianBlur } from "@/packages/use-shader-fx/src/hooks/blur/useGaussianBlur";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;
	void main() {
		vec2 vel = texture2D(src, vUv).xy;
		float len = length(vel);
		vel = vel * 0.5 + 0.5;
		
		vec3 color = vec3(vel.x, vel.y, 1.0);
		color = mix(vec3(1.0), color, len);

		gl_FragColor = vec4(color,  1.0);
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [app] = useTexture(["/app-head.jpg"]);

   const blur = useGaussianBlur({
      size,
      dpr: 1,
      radius: 21,
      // blurIteration: 1,
      // src: app,
      texture: {
         src: app,
      }
   });

   blur.setValues({
      radius: 41,
      // blurIteration: 20,
   });

   useFrame((state) => {
      blur.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={blur.texture} />
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
