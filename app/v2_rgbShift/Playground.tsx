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
} from "@/packages/use-shader-fx/src";
import { Float, OrbitControls, useTexture } from "@react-three/drei";
import { useGaussianBlur } from "@/packages/use-shader-fx/src/hooks/blur/useGaussianBlur";
import { useCoverTexture } from "@/packages/use-shader-fx/src/hooks/useCoverTexture";
import { useNoise } from "@/packages/use-shader-fx/src";
import gsap from "gsap";

const FxMaterialImpl = createFxMaterialImpl({
   fragmentShader: `
	uniform sampler2D src;
	void main() {
      

		gl_FragColor = texture2D(src, vUv);
	}
`,
});
const BasicFxMaterialImpl = createBasicFxMaterialImpl();

extend({ FxMaterialImpl, BasicFxMaterialImpl });

export const Playground = () => {
   const { size, viewport, camera } = useThree();

   const [app] = useTexture(["/dummy2.png"]);

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.01,
   })

   const coverTexture = useCoverTexture({
      size,
      dpr: 1,      
      src: app, 
      textureResolution: new THREE.Vector2(app.image.width, app.image.height),
   })   

   const rgbShift = useRGBShift({
      size,
      dpr: 2,
      src: coverTexture.texture,
      shiftPower: new THREE.Vector2(2, 2),
      shiftPowerSrc: noise.texture,
   })
   

   useFrame((state) => {                        
      coverTexture.render(state);
      noise.render(state);
      rgbShift.render(state); 
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={rgbShift.texture} />
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
