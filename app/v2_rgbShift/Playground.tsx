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

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.001,
      timeOffset: 0,
   })

   const noise2 = useNoise({
      size,
      dpr: 1,
      scale: 0.001,
      timeOffset: .04,
   })

   const noise3 = useNoise({
      size,
      dpr: 1,
      scale: 0.001,
      timeOffset: .08,
   })

   const rgbShift = useRGBShift({
      size,
      dpr: 2,
      shiftScale: .18,
      src: coverTexture.texture,
      shiftPower: new THREE.Vector2(2, 2),
      shiftPowerSrcR: noise.texture,      
      shiftPowerSrcG: noise2.texture,      
      shiftPowerSrcB: noise3.texture,      
      isUseShiftPowerSrcR: true,
      isUseShiftPowerSrcG: true,
      isUseShiftPowerSrcB: true,
   })

   const gBlur = useGaussianBlur({
      size,
      dpr: 1,
      radius: 3,
      src: rgbShift.texture,
      sigma: new THREE.Vector2(1, 1),
   })
   

   useFrame((state) => {
      coverTexture.render(state);
      noise.render(state);
      noise2.render(state);
      noise3.render(state);
      rgbShift.render(state);   
      gBlur.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={gBlur.texture} />
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
