import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../types";
import { getDpr, useSetup } from "../../utils";
import { RootState } from "../types";
import { RGBShiftMaterial, RGBShiftValues } from "../../materials";
import { useSingleFBO } from "../../utils/useSingleFBO";

type RGBShiftValuesAndConfig = RGBShiftValues;
export type RGBShiftProps = HooksProps & RGBShiftValuesAndConfig;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRGBShift = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: RGBShiftProps): HooksReturn<RGBShiftValuesAndConfig, RGBShiftMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: RGBShiftMaterial,
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
      (newValues: RGBShiftValuesAndConfig) => {
         const { ...rest } = newValues;
         material.setUniformValues(rest);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: RGBShiftValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);
         updateRenderTarget({ gl });
         return renderTarget.texture;
      },
      [setValues, updateRenderTarget, renderTarget]
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
