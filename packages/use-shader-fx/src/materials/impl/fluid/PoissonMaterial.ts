import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/poisson.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

type PoissonUniforms = {
   isBounce: { value: boolean };
   pressure: { value: THREE.Texture };
   divergence: { value: THREE.Texture };
};

export class PoissonMaterial extends FxMaterial {
   static get type() {
      return "PoissonMaterial";
   }

   uniforms!: PoissonUniforms;

   iteration: number;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super({
         vertexShader: vertex.poisson,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            isBounce: { value: true },
            pressure: { value: DEFAULT_TEXTURE },
            divergence: { value: DEFAULT_TEXTURE },
         } as PoissonUniforms,
      });
      this.type = PoissonMaterial.type;
      this.iteration = 32;
   }
}
