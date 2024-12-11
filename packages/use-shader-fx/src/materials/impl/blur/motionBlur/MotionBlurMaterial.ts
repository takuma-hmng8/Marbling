import * as THREE from "three";
import { fragment, vertex } from "./motionBlur.glsl";
import { FxMaterialProps } from "../../../core/FxMaterial";
import { NestUniformValues } from "../../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../../misc";
import { SamplingFxMaterial, SamplingFxUniforms, SamplingFxValues } from "../../../core/SamplingFxMaterial";

type MotionBlurUniforms = {
   /**  */
   backBuffer: { 
      value: TexturePipelineSrc
    };
    mixRatio: {
      value: number;
    };
} & SamplingFxUniforms;

export type MotionBlurValues = NestUniformValues<MotionBlurUniforms> &
   SamplingFxValues;

export class MotionBlurMaterial extends SamplingFxMaterial {   
   static get type() {
      return "MotionBlurMaterial";
   }

   uniforms!: MotionBlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<MotionBlurValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            backBuffer: {
               value: new THREE.Texture(),
            },            
            mixRatio: {
               value: 0.06,
            },
         } as MotionBlurUniforms,
      });            

      this.type = MotionBlurMaterial.type;
   }
}
