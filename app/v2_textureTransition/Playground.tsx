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
   uniforms: {
      targetTexture: { value: THREE.Texture },
      u_time: { value: 0 },
   },
   fragmentShader: `
	uniform sampler2D src;
	uniform sampler2D targetTexture;
	uniform float u_time;
	void main() {

		float progress = sin(u_time * .1) * 0.5 + 0.5;
		if(vUv.x < progress) {
			vec4 srcColor = texture2D(targetTexture,vec2(progress,vUv.y));
			gl_FragColor = srcColor;
		}else {
			vec2 fitScale = vec2(1.,1.);
			vec2 uv = vUv * fitScale + (1.0 - fitScale) * .5;
			vec4 srcColor = texture2D(src,uv);
			gl_FragColor = srcColor;
		}
	}
`,
});

const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [funkun, funkun2] = useTexture(["/momo.jpg", "/momo.jpg"]);

   const material = useRef<THREE.ShaderMaterial>();

   useFrame((state) => {
      if (material.current) {
         material.current.uniforms.u_time.value = state.clock.getElapsedTime();
      }
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl
            ref={material}
            key={FxMaterialImpl.key}
            src={funkun}
            targetTexture={funkun2}
         />
      </mesh>
   );
};
