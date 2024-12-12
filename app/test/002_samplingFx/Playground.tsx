"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   createBasicFxMaterialImpl,
   FxMaterialImplValues,
   BasicFxMaterialImplValues,
   useGaussianBlur,
   useCoverTexture,
   useNoise,
   useBoxBlur
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
   // const gbBur = useGaussianBlur({
   //    size,
   //    dpr: 1,
   //    radius: 4,
   //    sigma: new THREE.Vector2(2, 2), 
   //    texture: {         
   //       src: app,
   //       fit: 'cover',                  
   //    }
   // });

   const bb = useBoxBlur({
      size,
      dpr: 1,      
      texture: {         
         src: app,
         fit: 'fill',                  
      }
   })

   console.log(SamplingFxMaterial.key)

   useFrame((state) => {
      // console.log(gbBur.material.uniforms)
      // app.render(state);      
      // gbBur.render(state);      
      // gbBur.render(state);
      bb.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={bb.texture} />
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
