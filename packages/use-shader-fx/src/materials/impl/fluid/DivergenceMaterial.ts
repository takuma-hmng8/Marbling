import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/divergence.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";
import { DeltaTime } from ".";

type DivergenceUniforms = {
   isBounce: { value: boolean };
   velocity: { value: THREE.Texture };
   dt: { value: number };
};

export class DivergenceMaterial extends FxMaterial {
   static get type() {
      return "DivergenceMaterial";
   }

   uniforms!: DivergenceUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super({
         vertexShader: vertex.main,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            isBounce: { value: true },
            velocity: { value: DEFAULT_TEXTURE },
            dt: { value: DeltaTime },
         } as DivergenceUniforms,
      });

      this.type = DivergenceMaterial.type;
   }
}
