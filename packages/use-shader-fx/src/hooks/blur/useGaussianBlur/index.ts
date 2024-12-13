import * as THREE from "three";
import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../../types";
import {
   getDpr,
   useFxScene,
   useDoubleFBO,
   useMutableState,
} from "../../../utils";
import { RootState } from "../../types";
import { GaussianBlurMaterial, GaussianBlurValues } from "../../../materials";

type GaussianBlurConfig = {
   radius?: number;
};

type GaussianBlurValuesAndConfig = GaussianBlurValues & GaussianBlurConfig;

export type GaussianBlurProps = HooksProps & GaussianBlurValuesAndConfig;

export const useGaussianBlur = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   radius = 1,   
   ...uniformValues
}: GaussianBlurProps): HooksReturn<
   GaussianBlurValuesAndConfig,
   GaussianBlurMaterial
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: GaussianBlurMaterial,
      uniformValues,
      materialParameters: {
         ...materialParameters,
         defines: {
            KERNEL_SIZE: radius,
         },
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

   const [config, setConfig] = useMutableState<GaussianBlurConfig>({
      radius,
   });

   const setValues = useCallback(
      (newValues: GaussianBlurValuesAndConfig) => {
         const { radius, ...rest } = newValues;
         if (radius) {
            setConfig((prev) => {
               if (radius !== prev.radius) material.setBlurRadius(radius);
               return { radius };
            });
         }
         material.setUniformValues(rest);
      },
      [material, setConfig]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: GaussianBlurValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);                  

         // draw vertical blur
         updateRenderTarget({ gl }, () => {
            material.uniforms.texture_src.value = uniformValues.texture?.src || new THREE.Texture();
            material.uniforms.u_stepSize.value.set(0, 1);         
            material.uniforms.renderCount.value = 0;   
            material.updateFx();
         });

         // draw horizontal blur
         updateRenderTarget({ gl }, ({ read }) => {
            material.uniforms.texture_src.value = read;
            material.uniforms.u_stepSize.value.set(1, 0);
            material.uniforms.renderCount.value = 1;
            material.updateFx();
         });

         return renderTarget.read.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, uniformValues.texture?.src]
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
