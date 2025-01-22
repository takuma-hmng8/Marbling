"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";

const FxMaterialImpl = createFxMaterialImpl();

extend({ FxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

   const [app] = useTexture(["/funkun.jpg"]);

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.02,
      timeStrength: 0.4,
      mixDst: {
         src: app,
         colorFactor: 0.5,
         uvFactor: 0.5,
         alphaFactor: 0.5,
         fit: "cover",
      },
   });

   // noise.setValues({
   //    mixDst: {
   //       src: app,
   //       colorFactor: 0.5,
   //       uvFactor: 0.5,
   //       alphaFactor: 0.5,
   //       fit: "cover",
   //    },
   // });

   useFrame((state) => {
      noise.render(state);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <fxMaterialImpl key={FxMaterialImpl.key} src={noise.texture} />
      </mesh>
   );
};

declare global {
   namespace JSX {
      interface IntrinsicElements {
         fxMaterialImpl: FxMaterialImplValues &
            JSX.IntrinsicElements["shaderMaterial"];
      }
   }
}
