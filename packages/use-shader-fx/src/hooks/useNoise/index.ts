import { useCallback } from "react";
import { useSingleFBO, getDpr, useSetup } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import {
   NoiseMaterial,
   NoiseMaterialProps,
   NoiseValues,
} from "../../materials";

export type NoiseProps = HooksProps & NoiseValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useNoise = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: NoiseProps): HooksReturn<
   NoiseValues,
   NoiseMaterial & NoiseMaterialProps
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: NoiseMaterial,
      uniformValues,
      materialParameters,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: NoiseValues, needsUpdate: boolean = true) => {
         material.setUniformValues(newValues, needsUpdate);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: NoiseValues) => {
         const { gl, clock } = rootState;
         newValues && setValues(newValues, false);
         material.uniforms.tick.value =
            newValues?.tick || clock.getElapsedTime();
         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget, material]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
      camera,
      renderTarget,
   };
};
