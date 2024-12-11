"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useRGBShift,   
   useDistortion
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
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

   const [app] = useTexture(["/dummy3.png"]);
   // const [app] = useTexture(["/funkun.jpg"]);
   // const [app] = useTexture(["/private//fv.png"]);

   const coverTexture = useCoverTexture({
      size,
      dpr: 1,      
      src: app,       
      textureResolution: new THREE.Vector2(app.image.width, app.image.height),      
   })   

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.002,
      timeStrength: 0.01,
      timeOffset: 0,
   })

   const noise2 = useNoise({
      size,
      dpr: 1,
      scale: 0.002,      
      timeStrength: 0.01,
      timeOffset: .1,
   })

   const noise3 = useNoise({
      size,
      dpr: 1,
      scale: 0.002,   
      timeStrength: 0.01,
      timeOffset: .2,
   })

   const rgbShift = useRGBShift({
      size,
      dpr: 2,
      shiftScale: .04,
      shiftPower: new THREE.Vector2(2, 2),
      shiftPowerSrcR: noise.texture,      
      shiftPowerSrcG: noise2.texture,      
      shiftPowerSrcB: noise3.texture,      
      isUseShiftPowerSrcR: true,
      isUseShiftPowerSrcG: true,
      isUseShiftPowerSrcB: true,
      texture: {
         src: coverTexture.texture
      },      
   })


   const motionBlur = useMotionBlur({
      size,
      dpr: 1,      
      texture: {
         src: rgbShift.texture
      },            
   });

   const distortion = useDistortion({
      size,
      dpr: 1,      
      scale: new THREE.Vector2(0.,0.2),      
      freq: new THREE.Vector2(120.,1.),
      powNum: new THREE.Vector2(1.,1.),
      timeStrength: new THREE.Vector2(1.0,1.0),
      texture: {
        src: motionBlur.texture 
      }
   }) 

   useFrame((state) => {

   
      coverTexture.render(state);      
      noise.render(state);
      noise2.render(state);
      noise3.render(state);
      rgbShift.render(state);
      motionBlur.render(state);         
      distortion.render(state);
      // gbBur.render(state);      
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={distortion.texture} />
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
