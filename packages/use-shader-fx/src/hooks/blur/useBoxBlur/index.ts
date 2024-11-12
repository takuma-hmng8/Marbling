import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { RootState } from "../../types";
import { BoxBlurMaterial, BoxBlurValues } from "../../../materials";
import { useFxScene } from "../../../utils/useFxScene";
import { useDoubleFBO } from "../../../utils/useDoubleFBO";

type BoxBlurConfig = {
   blurIteration?: number;
};

export type BoxBlurProps = HooksProps & BoxBlurValues & BoxBlurConfig;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBoxBlur = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   blurIteration = 5,
   ...uniformValues
}: BoxBlurProps): HooksReturn<BoxBlurValues, BoxBlurMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: BoxBlurMaterial,
      uniformValues,
      materialParameters,
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
      (newValues: BoxBlurValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: BoxBlurValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);

         const srcCache = material.uniforms.src?.value;

         material.updateBasicFx();

         updateRenderTarget({ gl });

         for (let i = 0; i < blurIteration; i++) {
            updateRenderTarget({ gl }, ({ read }) => {
               material.uniforms.src.value = read;
            });
         }

         material.uniforms.src.value = srcCache;

         return renderTarget.read.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, blurIteration]
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
