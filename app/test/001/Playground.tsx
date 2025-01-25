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
   // app.source.data.width = 60;
   // app.source.data.height = 2;

   const noise = useNoise({
      size,
      dpr: 1,
      scale: 0.03,
      timeStrength: 0.4,
      mixDst: {
         src: app,
         colorFactor: 0.05,
         uvFactor: 0.05,
         alphaFactor: 0.5,
         fit: "fill",
      },
   });

   const shadows = useRef(new THREE.Vector4(0.1, 0.5, 0.1, 0.1));

   noise.setValues({
      mixDst: {
         src: app,
         colorFactor: 0.5,
         uvFactor: 0.1,
         alphaFactor: 0.5,
         fit: "contain",
      },
      // levels: {
      //    shadows: shadows.current,
      //    midtones: new THREE.Vector4(2.1, 0, 0, 1),
      //    outputMin: new THREE.Vector4(1.3, 0.1, 0.1, 1),
      // },
      // contrast: {
      //    factor: new THREE.Vector4(0.3, 0.2, 0.1, 1),
      // },
      // colorBalance: false,
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
