import * as THREE from "three";
import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { AdvectionMaterial } from "../../../materials";
import { SingleFBOUpdateFunction, useSetup } from "../../../utils";

export const useAdvection = (
   {
      size,
      dpr,
      ...values
   }: {
      size: Size;
      dpr: number | false;
      velocity: THREE.Texture;
   },
   updateRenderTarget: SingleFBOUpdateFunction
) => {
   const { scene, material, camera } = useSetup({
      size,
      dpr,
      material: AdvectionMaterial,
      uniformValues: values,
   });

   const render = useCallback(
      (rootState: RootState) => {
         const { gl } = rootState;
         updateRenderTarget({ gl, scene, camera });
      },
      [updateRenderTarget, scene, camera]
   );

   return { render, material };
};
