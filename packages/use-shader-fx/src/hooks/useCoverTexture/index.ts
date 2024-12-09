import { useCallback } from "react";
import { useSingleFBO, getDpr, useFxScene } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { CoverTextureMaterial, CoverTextureValues } from "../../materials";

export type CoverTextureProps = HooksProps & CoverTextureValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useCoverTexture = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: CoverTextureProps): HooksReturn<
   CoverTextureValues,
   CoverTextureMaterial
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: CoverTextureMaterial,
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
      (newValues: CoverTextureValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: CoverTextureValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);

         material.updateFx();

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
