import { fragment, vertex } from "./distortion.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../misc";
import * as THREE from 'three';

type DistortionUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   time: { value: number };
   scale: { value: THREE.Vector2 };   
   freq: { value: THREE.Vector2 };
   timeStrength: { value: THREE.Vector2 };
   timeOffset: { value: number };            
   powNum: { value: THREE.Vector2 };
} & BasicFxUniforms;

export type DistortionValues = NestUniformValues<DistortionUniforms> & BasicFxValues;

export class DistortionMaterial extends BasicFxMaterial {
   static get type() {
      return "DistortionMaterial";      
   }

   uniforms!: DistortionUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<DistortionValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            time: { value: 0 },
            scale: { value: new THREE.Vector2(1,1) },
            freq: { value: new THREE.Vector2(1,1) },
            timeStrength: { value: new THREE.Vector2(1,1) },
            timeOffset: { value: 0 },
            powNum: { value: new THREE.Vector2(1,1) },
         } as DistortionUniforms,
      });

      this.type = DistortionMaterial.type;
   }
}
