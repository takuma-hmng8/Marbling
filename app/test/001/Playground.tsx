"use client";

import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import {
   BASICFX_VALUES,
   createFxMaterialImpl,
   FxMaterialImplValues,
   useNoise,
} from "@/packages/use-shader-fx/src";
import { useTexture } from "@react-three/drei";
import { useGUI } from "@/utils/useGUI";
import GUI from "lil-gui";

const FxMaterialImpl = createFxMaterialImpl();

extend({ FxMaterialImpl });

const BASICFX_CONFIG = BASICFX_VALUES;

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
         colorFactor: 0.05,
         uvFactor: 0.1,
         alphaFactor: 0.5,
         fit: "contain",
      },
   });

   const updateGUI = useGUI((gui: GUI) => {
      // levels
      const levels = gui.addFolder("levels");
      levels
         .add(BASICFX_CONFIG.levels, "value")
         .name("enabled")
         .onChange((v: boolean) => noise.setValues({ levels: v }));
      levels
         .add(BASICFX_CONFIG.levels_shadows.value, "x", -1, 1, 0.01)
         .name("shadows r");
      levels
         .add(BASICFX_CONFIG.levels_shadows.value, "y", -1, 1, 0.01)
         .name("shadows g");
      levels
         .add(BASICFX_CONFIG.levels_shadows.value, "z", -1, 1, 0.01)
         .name("shadows b");
      // contrast
      const contrast = gui.addFolder("contrast");
      contrast
         .add(BASICFX_CONFIG.contrast, "value")
         .name("enabled")
         .onChange((v: boolean) => noise.setValues({ contrast: v }));
      contrast
         .add(BASICFX_CONFIG.contrast_factor.value, "x", 0, 2, 0.01)
         .name("r");
      contrast
         .add(BASICFX_CONFIG.contrast_factor.value, "y", 0, 2, 0.01)
         .name("g");
      contrast
         .add(BASICFX_CONFIG.contrast_factor.value, "z", 0, 2, 0.01)
         .name("b");
   });

   // noise.setValues({
   //    mixDst: {
   //       fit: "cover",
   //    },
   // });

   useFrame((state) => {
      noise.render(state, {
         levels: {
            shadows: BASICFX_CONFIG.levels_shadows.value,
         },
         contrast: {
            factor: BASICFX_CONFIG.contrast_factor.value,
         },
      });
      updateGUI();
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
