import * as THREE from "three";
import { useCallback } from "react";
import { useSingleFBO, useDoubleFBO, getDpr } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { useAdvection } from "./scenes/useAdvection";
import { useSplat } from "./scenes/useSplat";
import { useDivergence } from "./scenes/useDivergence";
import { usePoisson } from "./scenes/usePoisson";
import { usePressure } from "./scenes/usePressure";

export type FluidValues = {
   /*===============================================
	TODO * 
	- 出力でcolormapとvelocitymapを選択できるみたいな仕組みにする
		- colormapはBasicFxmaterial
	- params
	 - velocity dissipation
	 - color dissipation (color map　/ pressure disippation的なこと？)　
	 
	===============================================*/
};

export type FluidProps = HooksProps & FluidValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useFluid = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   ...values
}: FluidProps): HooksReturn<FluidValues, any> => {
   const _dpr = getDpr(dpr);

   // fbos
   const fboProps = {
      dpr: _dpr.fbo,
      size,
      fboAutoSetSize,
      type: THREE.HalfFloatType,
      ...renderTargetOptions,
   };
   const [velocity_0, updateVelocity_0] = useSingleFBO(fboProps);
   const [velocity_1, updateVelocity_1] = useSingleFBO(fboProps);
   const [divergenceFBO, updateDivergenceFBO] = useSingleFBO(fboProps);
   const [pressureFBO, updatePressureFBO] = useDoubleFBO(fboProps);

   // scenes
   const SceneSize = { size, dpr: _dpr.shader };
   const advection = useAdvection(
      {
         ...SceneSize,
         velocity: velocity_0.texture,
      },
      updateVelocity_1
   );
   const splat = useSplat(SceneSize, updateVelocity_1);
   const divergence = useDivergence(
      {
         ...SceneSize,
         velocity: velocity_1.texture,
      },
      updateDivergenceFBO
   );
   const poisson = usePoisson(
      {
         ...SceneSize,
         divergence: divergenceFBO.texture,
      },
      updatePressureFBO
   );
   const pressure = usePressure(
      {
         ...SceneSize,
         velocity: velocity_1.texture,
         pressure: pressureFBO.read.texture,
      },
      updateVelocity_0
   );

   const setValues = useCallback((newValues: FluidValues) => {
      // splat.material.force = newValues.force;
      // bounce の設定
      divergence.material.uniforms.isBounce.value = false;
      poisson.material.uniforms.isBounce.value = false;
      pressure.material.uniforms.isBounce.value = false;
   }, []);

   // bounce の設定 一旦OFFに
   divergence.material.uniforms.isBounce.value = false;
   poisson.material.uniforms.isBounce.value = false;
   pressure.material.uniforms.isBounce.value = false;

   const render = useCallback(
      (rootState: RootState, newValues?: FluidValues) => {
         newValues && setValues(newValues);

         [advection, splat, divergence, poisson, pressure].forEach((shader) => {
            shader.render(rootState);
         });

         return velocity_0.texture;
      },
      [
         setValues,
         velocity_0.texture,
         advection,
         splat,
         divergence,
         poisson,
         pressure,
      ]
   );

   return {
      render,
      setValues,
      texture: velocity_0.texture,
      // material,
      // scene,
   };
};
