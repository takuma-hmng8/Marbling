import { useCallback } from "react";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { RootState } from "../../types";
import { GaussianBlurMaterial, GaussianBlurValues } from "../../../materials";
import { useFxScene } from "../../../utils/useFxScene";
import { useDoubleFBO } from "../../../utils/useDoubleFBO";
import * as THREE from "three";
import { useMutableConfig } from "../../../utils/useMutableConfig";

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
   src, // TODO * ここでsrcを定義すると、uniformValuesにsrcがふくまれなくなっちゃう
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

   //THINKS * レンダー中に処理しちゃっていいかも. そもそも不要かも. materialのコメントを確認.
   material.setStep(size);

   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });

   const [config, setConfig] = useMutableConfig<GaussianBlurConfig>({
      radius,
   });

   const setValues = useCallback(
      (newValues: GaussianBlurValuesAndConfig) => {
         const { radius, ...rest } = newValues;
         if (radius) {
            setConfig((prev) => {
               // 変更がある場合だけsetBlurRadiusを実行する
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
            material.uniforms.src.value = src || new THREE.Texture();
            material.uniforms.u_stepSize.value.set(0, 1);
            material.updateBasicFx();
         });

         // draw horizontal blur
         updateRenderTarget({ gl }, ({ read }) => {
            material.uniforms.src.value = read;
            material.uniforms.u_stepSize.value.set(1, 0);
            material.updateBasicFx();
         });

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
