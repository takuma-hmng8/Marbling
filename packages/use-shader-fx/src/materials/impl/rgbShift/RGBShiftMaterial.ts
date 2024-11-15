import { fragment, vertex } from "./rgbShift.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../misc";
import * as THREE from 'three';

type RGBShiftUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   shiftPower: { value: THREE.Vector2 };
} & BasicFxUniforms;

export type RGBShiftValues = NestUniformValues<RGBShiftUniforms> & BasicFxValues;

export class RGBShiftMaterial extends BasicFxMaterial {
   static get type() {
      return "RGBShiftMaterial";      
   }

   uniforms!: RGBShiftUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<RGBShiftValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            shiftPower: { value: new THREE.Vector2(1, 1) },            
         } as RGBShiftUniforms,
      });

      this.type = RGBShiftMaterial.type;
   }
}
