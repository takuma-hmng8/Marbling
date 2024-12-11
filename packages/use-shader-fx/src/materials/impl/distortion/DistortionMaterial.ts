import * as THREE from 'three';
import { fragment, vertex } from "./distortion.glsl";
import { FxMaterialProps } from "../../core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { SamplingFxMaterial, SamplingFxUniforms, SamplingFxValues } from "../../core/SamplingFxMaterial";

type DistortionUniforms = {
   /**  */
   time: { value: number };
   scale: { value: THREE.Vector2 };   
   freq: { value: THREE.Vector2 };
   timeStrength: { value: THREE.Vector2 };
   timeOffset: { value: number };            
   powNum: { value: THREE.Vector2 };   
   glitchSpeed: { value: number };   
   glitchPower: { value: number };
   glitchThreshold: { value: number };
   glitchFreq: { value: THREE.Vector2 };   
} & SamplingFxUniforms

export type DistortionValues = NestUniformValues<DistortionUniforms> & SamplingFxValues;

export class DistortionMaterial extends SamplingFxMaterial {
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
            time: { value: 0 },
            scale: { value: new THREE.Vector2(1,1) },
            freq: { value: new THREE.Vector2(1,1) },
            timeStrength: { value: new THREE.Vector2(1,1) },
            timeOffset: { value: 0 },
            powNum: { value: new THREE.Vector2(1,1) },             
            glitchSpeed: { value: 1 },
            glitchPower: { value: 1.0 },
            glitchFreq: { value: new THREE.Vector2(100,10) },      
            glitchThreshold: { value: 0.2 },
         } as DistortionUniforms,
      });

      this.type = DistortionMaterial.type;
   }
}
