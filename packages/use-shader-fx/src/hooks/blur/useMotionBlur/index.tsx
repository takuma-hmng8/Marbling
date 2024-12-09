import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../../types";
import {
   getDpr,
   useDoubleFBO,
   useFxScene,   
} from "../../../utils";
import { RootState } from "../../types";
import { MotionBlurMaterial, MotionBlurValues } from "../../../materials";

type MotionBlurConfig = {   
};

type MotionBlurValuesAndConfig = MotionBlurValues & MotionBlurConfig;

export type MotionBlurProps = HooksProps & MotionBlurValuesAndConfig;

export const useMotionBlur = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,   
   ...uniformValues
}: MotionBlurProps): HooksReturn<
   MotionBlurValuesAndConfig,
   MotionBlurMaterial
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: MotionBlurMaterial,
      uniformValues,
      materialParameters: {
         ...materialParameters,         
      },
   });

   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: MotionBlurValuesAndConfig) => {
         const { ...rest } = newValues;         
         material.setUniformValues(rest);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: MotionBlurValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);
                  
         updateRenderTarget({gl}, ({read}) => {
            material.uniforms.backBuffer.value = read;                
            material.updateFx();
         });         
                  
         return renderTarget.read.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, uniformValues.src]
   );

   return {
      render,
      setValues,
      texture: renderTarget.read.texture,
      material,
      scene,
      camera,
      renderTarget,
   };
};
