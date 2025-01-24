import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/pressure.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from ".";

type PressureUniforms = {
   isBounce: { value: boolean };
   pressure: { value: THREE.Texture };
   velocity: { value: THREE.Texture };
   dt: { value: number };
};

export class PressureMaterial extends FxMaterial {
   static get type() {
      return "PressureMaterial";
   }

   uniforms!: PressureUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super({
         vertexShader: vertex.main,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            isBounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         } as PressureUniforms,
      });

      this.type = PressureMaterial.type;
   }
}
