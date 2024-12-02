import * as THREE from "three";
import { fragment, vertex } from "./gaussianBlur.glsl";
import { BasicFxMaterial } from "../../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../../core/BasicFxLib";
import { NestUniformValues } from "../../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../../misc";
import { SamplingFxMaterial } from "../../../core/SamplingFxMaterial";
import { SamplingFxUniforms, SamplingFxValues } from "../../../core/SamplingFxLib";

type GaussianBlurUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   sigma: {
      value: THREE.Vector2;
   };
   u_weights: {
      value: number[];
   };
   u_stepSize: {
      value: THREE.Vector2;
   };
} & SamplingFxUniforms;

export type GaussianBlurValues = NestUniformValues<GaussianBlurUniforms> &
   SamplingFxValues;

export class GaussianBlurMaterial extends SamplingFxMaterial {
   static get type() {
      return "GaussianBlurMaterial";
   }

   uniforms!: GaussianBlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<GaussianBlurValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: {
               value: null,
            },
            sigma: {
               value: new THREE.Vector2(1, 1),
            },
            u_weights: {
               value: [0],
            },
            u_stepSize: {
               value: new THREE.Vector2(0),
            },
         } as GaussianBlurUniforms,
      });

      // 初期化時に更新
      this.setBlurRadius(materialParameters.defines.KERNEL_SIZE);

      this.type = GaussianBlurMaterial.type;
   }

   setBlurRadius(kernelSize: number) {
      const weights = [];
      let t = 0.0; 

      for (let i = kernelSize - 1; i >= 0; i--) {
         let r = 1.0 + 2.0 * i;
         let w = Math.exp((-0.5 * (r * r)) / (kernelSize * kernelSize));
         weights.push(w);
         if (i > 0) {
            w *= 2.0;
         }
         t += w;
      }

      for (let i = 0; i < weights.length; i++) {
         weights[i] /= t;
      }

      // materiaに反映して更新を通知
      this.defines.KERNEL_SIZE = kernelSize;
      this.uniforms.u_weights.value = weights;
      this.needsUpdate = true;
   }
}
