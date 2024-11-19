import * as THREE from "three";
import { fragment, vertex } from "./motionBlur.glsl";
import { BasicFxMaterial } from "../../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../../core/BasicFxLib";
import { NestUniformValues } from "../../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../../misc";

type MotionBlurUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   backBuffer: { 
      value: TexturePipelineSrc
    };
    mixRatio: {
      value: number;
    };
} & BasicFxUniforms;

export type MotionBlurValues = NestUniformValues<MotionBlurUniforms> &
   BasicFxValues;

export class MotionBlurMaterial extends BasicFxMaterial {   
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
            src: {
               value: null,
            },
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
