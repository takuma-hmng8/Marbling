"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   createFxMaterialImpl,
   FxMaterialImplValues,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
import { useRef } from "react";

const FxMaterialImpl = createFxMaterialImpl();

extend({ FxMaterialImpl });

export const Playground = () => {
   const { size } = useThree();

   const [app] = useTexture(["/funkun.jpg"]);

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.03,
      timeStrength: 0.4,
      mixDst: {
         src: app,
         colorFactor: 0.5,
         uvFactor: 0.5,
         alphaFactor: 0.5,
         fit: "cover",
      },
   });

   const shadows = useRef(new THREE.Vector4(0.1, 0.5, 0.1, 0.1));

   noise.setValues({
      mixDst: {
         src: app,
         colorFactor: 0.5,
         uvFactor: 0.5,
         alphaFactor: 0.5,
         fit: "cover",
      },
      levels: false,
      contrast: {
         factor: new THREE.Vector4(3, 0.1, 0.1, 1),
      },
   });

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
