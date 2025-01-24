import * as THREE from "three";
import { useCallback } from "react";
import { RootState, Size } from "../../types";
import { DivergenceMaterial } from "../../../materials";
import { useSetup, SingleFBOUpdateFunction } from "../../../utils";

export const useDivergence = (
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
      material: DivergenceMaterial,
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
