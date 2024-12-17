"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useRGBShift
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
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
   const { size } = useThree();

   const [app] = useTexture(["/dummy2.png"]);

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.005,
      timeOffset: 0,
   })

   const noise2 = useNoise({
      size,
      dpr: 1,
      scale: 0.005,      
      timeOffset: .03,
   })

   const noise3 = useNoise({
      size,
      dpr: 1,
      scale: 0.005,            
      timeOffset: .06,
   })

   const rgbShift = useRGBShift({
      size,
      dpr: 2,
      shiftScale: .13,      
      shiftPower: new THREE.Vector2(2, 2),
      shiftPowerSrcR: noise.texture,      
      shiftPowerSrcG: noise2.texture,      
      shiftPowerSrcB: noise3.texture,      
      isUseShiftPowerSrcR: true,
      isUseShiftPowerSrcG: true,
      isUseShiftPowerSrcB: true,
      texture: {
         src: app,
         fit: 'cover',
      }
   })

   const motionBlur = useMotionBlur({
      size,
      dpr: 1,
      texture: {
         src: rgbShift.texture,
      }
   });

   useFrame((state) => {      
      noise.render(state);
      noise2.render(state);
      noise3.render(state);
      rgbShift.render(state);               
      motionBlur.render(state);      
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={motionBlur.texture} />
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
