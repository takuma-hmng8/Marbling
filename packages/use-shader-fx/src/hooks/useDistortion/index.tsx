import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { DistortionMaterial, DistortionValues } from "../../materials";
import { useFxScene } from "../../utils/useFxScene";
import { useSingleFBO } from "../../utils/useSingleFBO";

type DistortionValuesAndConfig = DistortionValues;
export type DistortionProps = HooksProps & DistortionValuesAndConfig;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useDistortion = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: DistortionProps): HooksReturn<DistortionValuesAndConfig, DistortionMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: DistortionMaterial,
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
      (newValues: DistortionValuesAndConfig) => {
         const { ...rest } = newValues;        
         material.setUniformValues(rest);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: DistortionValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);                  
         material.uniforms.time.value = rootState.clock.getElapsedTime();
         material.updateFx();         
         updateRenderTarget({ gl });         
         return renderTarget.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget]
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
