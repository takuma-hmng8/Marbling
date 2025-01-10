import * as THREE from "three";
import vertex from "./shaders/vertex";
import fragment from "./shaders/splat.frag";
import {
   FxMaterial,
   FxMaterialProps,
} from "../../../materials/core/FxMaterial";

type SplatUniforms = {
   force: { value: THREE.Vector2 };
   center: { value: THREE.Vector2 };
   scale: { value: THREE.Vector2 };
};

export class SplatMaterial extends FxMaterial {
   static get type() {
      return "SplatMaterial";
   }

   forceBias: number;

   uniforms!: SplatUniforms;

   constructor({ uniformValues, materialParameters = {} }: FxMaterialProps) {
      super({
         vertexShader: vertex.splat,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            force: { value: new THREE.Vector2(0, 0) },
            center: { value: new THREE.Vector2(0, 0) },
            scale: { value: new THREE.Vector2(60, 60) },
         } as SplatUniforms,
      });

      this.type = SplatMaterial.type;

      this.forceBias = 20;

      this.blending = THREE.AdditiveBlending;
   }
}
