"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree, extend, createPortal } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useRGBShift,
   useGaussianBlur
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls, useTexture } from "@react-three/drei";
import { useCoverTexture } from "@/packages/use-shader-fx/src/hooks/useCoverTexture";
import { useNoise } from "@/packages/use-shader-fx/src";
import { useMotionBlur } from "@/packages/use-shader-fx/src/hooks/blur/useMotionBlur";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;
	void main() {      
		vec4 oC = texture2D(src, vUv);            
      gl_FragColor = oC;
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [app] = useTexture(["/dummy2.png"]);

   const coverTexture = useCoverTexture({
      size,
      dpr: 1,      
      src: app,       
      textureResolution: new THREE.Vector2(app.image.width, app.image.height),
   })   


   const gbBur = useGaussianBlur({
      size,
      dpr: 1,
      radius: 2,      
      sigma: new THREE.Vector2(0, 0),
      src: coverTexture.texture,
   });

   useFrame((state) => {
      coverTexture.render(state);      
      gbBur.render(state);      

      // console.log(gbBur.material.vertexShader)
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={gbBur.texture} />
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
