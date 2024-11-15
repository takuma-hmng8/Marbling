import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { RGBShiftMaterial, RGBShiftValues } from "../../materials";
import { useFxScene } from "../../utils/useFxScene";
import { useMutableState } from "../../utils/useMutableState";
import { useSingleFBO } from "../../utils/useSingleFBO";

type RGBShiftConfig = {
//    blurIteration?: number;
};

type RGBShiftValuesAndConfig = RGBShiftValues & RGBShiftConfig;
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
//    blurIteration = 5,
   ...uniformValues
}: RGBShiftProps): HooksReturn<RGBShiftValuesAndConfig, RGBShiftMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
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

   const [config, setConfig] = useMutableState<RGBShiftConfig>({
    //   blurIteration,
   });

   const setValues = useCallback(
      (newValues: RGBShiftValuesAndConfig) => {
         const { ...rest } = newValues;
        //  setConfig({ blurIteration });
         material.setUniformValues(rest);
      },
      [material, setConfig]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: RGBShiftValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);         
         material.updateBasicFx();
         updateRenderTarget({ gl });
         return renderTarget.texture;
      },
      [setValues, updateRenderTarget, material, renderTarget, config]
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
