import * as THREE from "three";
import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";
import { PoissonMaterial } from "../../../materials";

export const usePoisson = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      divergence: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: PoissonMaterial,
      uniformValues: values,
   });

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         for (let i = 0; i < material.iteration; i++) {
            updateRenderTarget({ gl, scene, camera }, ({ read }) => {
               material.uniforms.pressure.value = read;
            });
         }
      },
      [updateRenderTarget, material, scene, camera]
   );

   return { render, material };
};
