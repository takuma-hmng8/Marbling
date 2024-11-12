import { fragment, vertex } from "./boxBlur.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../misc";

type BoxBlurUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   blurSize: { value: number };
} & BasicFxUniforms;

export type BoxBlurValues = NestUniformValues<BoxBlurUniforms> & BasicFxValues;

export class BoxBlurMaterial extends BasicFxMaterial {
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
            src: { value: null },
            blurSize: { value: 5 },
         } as BoxBlurUniforms,
      });

      this.type = BoxBlurMaterial.type;
   }
}
