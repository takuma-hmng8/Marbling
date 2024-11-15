import * as THREE from "three";
import { fragment, vertex } from "./boxBlur.glsl";
import { BasicFxMaterial } from "../../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../../core/BasicFxLib";
import { NestUniformValues } from "../../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../../misc";
import { Size } from "../../../../hooks/types";

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
   u_step: {
      value: THREE.Vector2;
   };
   u_stepSize: {
      value: THREE.Vector2;
   };
} & BasicFxUniforms;

export type GaussianBlurValues = NestUniformValues<GaussianBlurUniforms> &
   BasicFxValues;

export class GaussianBlurMaterial extends BasicFxMaterial {
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
            u_step: {
               value: new THREE.Vector2(0, 0),
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

      console.log("setBlurRadius", kernelSize);

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
      this.defines.KERNEL_SIZE = weights.length; // TODO * ここkerbelSizeをそのまま渡す方が直感的かな？
      this.uniforms.u_weights.value = weights;
      this.needsUpdate = true;
   }

   // TODO * これは必要？ resolutionをshaderで使っちゃえばいいのでは？
   // TODO * ちなみに、FxMaterialには、texelSizeというuniformがあるので、それをそのまま使えば処理も不要になるかも updateResolutionのupdateResolutionメソッドを確認。これらのDefaultUniformsは、全てのshaderで自動でprefixとして挿入される。
   setStep(size: Size) {
      this.uniforms.u_step.value.set(
         1 /
            (size?.width ||
               this.uniforms.resolution.value.x ||
               window.innerWidth),
         1 /
            (size?.height ||
               this.uniforms.resolution.value.y ||
               window.innerHeight)
      );
   }
}
