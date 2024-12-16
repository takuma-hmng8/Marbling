"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useBoxBlur,
   useRGBShift,
   useGaussianBlur,
   useCoverTexture
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
import { SamplingFxMaterial } from "@/packages/use-shader-fx/src/materials/core/SamplingFxMaterial";

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

   const [app] = useTexture(["/funkun.jpg"]);
   
   const gb = useGaussianBlur({
      size,
      dpr: 1,      
      radius: 10,
      sigma: new THREE.Vector2(2, 3),
      texture: {         
         src: app,
         fit: 'cover',
         resolution: new THREE.Vector2(1080,1080),
      }
   })

   

   useFrame((state) => {      
      gb.render(state);     
   });    

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={gb.texture} />
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
