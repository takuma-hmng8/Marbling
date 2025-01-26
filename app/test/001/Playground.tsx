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

   noise.setValues({
      mixDst: {
         src: app,
         colorFactor: 0.5,
         uvFactor: 0.1,
         alphaFactor: 0.5,
         fit: "contain",
      },
      posterize: false,
      grayscale: {
         weight: new THREE.Vector3(0, 0, 0),
         threshold: 0.32,
         duotone: {
            color0: new THREE.Color("red"),
            color1: new THREE.Color("blue"),
         },
      },
      hsv: {
         saturation: 1,
      },
      levels: false,
      contrast: {
         factor: new THREE.Vector4(2, 2, 0.1, 1),
      },
      colorBalance: {
         factor: new THREE.Vector3(0.1, 2, 1),
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
