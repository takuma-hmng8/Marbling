import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../../types";
import {
   getDpr,
   useFxScene,
   useDoubleFBO,
   useMutableRefState,
} from "../../../utils";
import { RootState } from "../../types";
import { BoxBlurMaterial, BoxBlurValues } from "../../../materials";

type BoxBlurConfig = {
   blurIteration?: number;
};

type BoxBlurValuesAndConfig = BoxBlurValues & BoxBlurConfig;
export type BoxBlurProps = HooksProps & BoxBlurValuesAndConfig;

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
}: BoxBlurProps): HooksReturn<BoxBlurValuesAndConfig, BoxBlurMaterial> => {
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

   const [config, setConfig] = useMutableRefState<BoxBlurConfig>({
      blurIteration,
   });

   const setValues = useCallback(
      (newValues: BoxBlurValuesAndConfig) => {
         const { blurIteration, ...rest } = newValues;
         if (blurIteration) setConfig({ blurIteration });
         material.setUniformValues(rest);
      },
      [material, setConfig]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: BoxBlurValuesAndConfig) => {
         const { gl } = rootState;
         newValues && setValues(newValues);

         const srcCache = material.uniforms.src?.value;

         material.updateBasicFx();

         updateRenderTarget({ gl });

         for (
            let i = 0;
            i < (config.current.blurIteration || blurIteration);
            i++
         ) {
            updateRenderTarget({ gl }, ({ read }) => {
               material.uniforms.src.value = read;
            });
         }

         material.uniforms.src.value = srcCache;

         return renderTarget.read.texture;
      },
      [
         setValues,
         updateRenderTarget,
         material,
         renderTarget,
         config,
         blurIteration,
      ]
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
