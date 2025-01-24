import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/advection.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from ".";

type AdvectionUniforms = {
   velocity: { value: THREE.Texture };
   dt: { value: number };
};

export class AdvectionMaterial extends FxMaterial {
   static get type() {
      return "AdvectionMaterial";
   }

   uniforms!: AdvectionUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super({
         vertexShader: vertex.advection,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         } as AdvectionUniforms,
      });
      this.type = AdvectionMaterial.type;
   }
}
