import * as THREE from 'three';
import { SamplingFxUniforms, SamplingFxValues, SamplingFxMaterial } from "../../core/SamplingFxMaterial";
import { fragment, vertex } from "./rgbShift.glsl";
import { FxMaterialProps } from "../../core/FxMaterial";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../misc";

type RGBShiftUniforms = {
   shiftPower: { value: THREE.Vector2 };      
   shiftPowerSrcR: { value: TexturePipelineSrc };
   isUseShiftPowerSrcR: { value: boolean };
   shiftPowerSrcG: { value: TexturePipelineSrc };
   isUseShiftPowerSrcG: { value: boolean };
   shiftPowerSrcB: { value: TexturePipelineSrc };
   isUseShiftPowerSrcB: { value: boolean };
   shiftScale: { value: number };
} & SamplingFxUniforms;

export type RGBShiftValues = NestUniformValues<RGBShiftUniforms> & SamplingFxValues;

export class RGBShiftMaterial extends SamplingFxMaterial {
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
            shiftPower: { value: new THREE.Vector2(1, 1) },            
            shiftPowerSrcR: { value: null },
            isUseShiftPowerSrcR: { value: false },
            shiftPowerSrcG: { value: null },
            isUseShiftPowerSrcG: { value: false },
            shiftPowerSrcB: { value: null },
            isUseShiftPowerSrcB: { value: false },
            shiftScale: { value: 0.01 },
         } as RGBShiftUniforms,
      });

      this.type = RGBShiftMaterial.type;
   }
}
