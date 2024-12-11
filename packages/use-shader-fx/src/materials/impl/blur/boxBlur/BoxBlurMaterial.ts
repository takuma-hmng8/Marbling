import { fragment, vertex } from "./boxBlur.glsl";
import { FxMaterialProps } from "../../../core/FxMaterial";
import { SamplingFxMaterial, SamplingFxUniforms, SamplingFxValues } from '../../../core/SamplingFxMaterial';
import { NestUniformValues } from "../../../../shaders/uniformsUtils";

type BoxBlurUniforms = {
   /**  */
   blurSize: { value: number };
} & SamplingFxUniforms;

export type BoxBlurValues = NestUniformValues<BoxBlurUniforms> & SamplingFxValues;

export class BoxBlurMaterial extends SamplingFxMaterial {
   static get type() {
      return "BoxBlurMaterial";      
   }

   uniforms!: BoxBlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<BoxBlurValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            blurSize: { value: 5 },
         } as BoxBlurUniforms,
      });

      this.type = BoxBlurMaterial.type;
   }
}
