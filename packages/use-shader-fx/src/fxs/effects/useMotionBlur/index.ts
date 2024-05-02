import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { useDoubleFBO, DoubleRenderTarget } from "../../../utils/useDoubleFBO";
import {
   CustomParams,
   setCustomUniform,
   setUniform,
} from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import type { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";
import { UseFboProps } from "../../..";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export type MotionBlurParams = {
   /** Make this texture blur, default : `THREE.Texture()` */
   texture?: THREE.Texture;
   /** motion begin, default : `THREE.Vector2(0, 0)` */
   begin?: THREE.Vector2;
   /** motion end, default : `THREE.Vector2(0, 0)` */
   end?: THREE.Vector2;
   /** motion strength, default : `0.9` */
   strength?: number;
};

export type MotionBlurObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
   output: THREE.Texture;
};

export const MOTIONBLUR_PARAMS: MotionBlurParams = Object.freeze({
   texture: DEFAULT_TEXTURE,
   begin: new THREE.Vector2(0, 0),
   end: new THREE.Vector2(0, 0),
   strength: 0.9,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useMotionBlur = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
   uniforms,
   onBeforeCompile,
}: HooksProps): HooksReturn<
   MotionBlurParams,
   MotionBlurObject,
   CustomParams
> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, uniforms, onBeforeCompile });
   const camera = useCamera(size);

   const fboProps = useMemo(
      () => ({
         scene,
         camera,
         size,
         dpr: _dpr.fbo,
         samples,
         isSizeUpdate,
      }),
      [scene, camera, size, _dpr.fbo, samples, isSizeUpdate]
   ) as UseFboProps;

   const [renderTarget, updateRenderTarget] = useDoubleFBO(fboProps);

   const [params, setParams] = useParams<MotionBlurParams>(MOTIONBLUR_PARAMS);

   const updateValue = setUniform(material);
   const updateCustomValue = setCustomUniform(material);

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: MotionBlurParams,
         customParams?: CustomParams
      ) => {
         const { gl } = props;

         newParams && setParams(newParams);

         updateValue("uTexture", params.texture!);
         updateValue("uBegin", params.begin!);
         updateValue("uEnd", params.end!);
         updateValue("uStrength", params.strength!);

         updateCustomValue(customParams);

         return updateRenderTarget(gl, ({ read }) => {
            updateValue("uBackbuffer", read);
         });
      },
      [updateRenderTarget, updateValue, setParams, params, updateCustomValue]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         mesh: mesh,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.read.texture,
      },
   ];
};