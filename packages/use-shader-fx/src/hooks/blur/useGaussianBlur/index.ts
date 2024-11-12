import { useCallback, useEffect, useMemo } from "react";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { RootState } from "../../types";
import { GaussianBlurMaterial, GaussianBlurValues } from "../../../materials";
import { useFxScene } from "../../../utils/useFxScene";
import { useDoubleFBO } from "../../../utils/useDoubleFBO";
import * as THREE from "three";

type GaussianBlurConfig = {   
   radius?: number;   
};

export type GaussianBlurProps = HooksProps & GaussianBlurValues & GaussianBlurConfig;

export const useGaussianBlur = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   radius = 1,   
   src,
   ...uniformValues
}: GaussianBlurProps 
): HooksReturn<GaussianBlurValues, GaussianBlurMaterial> => {
   const _dpr = getDpr(dpr);   

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: GaussianBlurMaterial,
      uniformValues,
      materialParameters: {
         defines: {
            "KERNEL_SIZE": radius,
         },
         ...materialParameters,
      },
   });

   useEffect(() => {      
      material.setBlurRadius(radius);
   },[material, radius]);

   useEffect(() => {      
      material.setStep({size});
   }, [material, size]); 

   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });
   
   const setValues = useCallback(
      (newValues: GaussianBlurValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: GaussianBlurValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);        
         
         // draw vertical blur                           
         updateRenderTarget({ gl }, () => {
            material.uniforms.src.value = src || new THREE.Texture();
            material.uniforms.u_stepSize.value.set(0, 1);
            material.updateBasicFx();
         });

         // draw horizontal blur
         updateRenderTarget({ gl }, ({ read }) => {
            material.uniforms.src.value = read;
            material.uniforms.u_stepSize.value.set(1, 0);
            material.updateBasicFx();
         })

         return renderTarget.read.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, src]
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
