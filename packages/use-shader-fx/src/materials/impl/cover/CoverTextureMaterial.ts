import * as THREE from "three";
import { fragment, vertex } from "./coverTexture.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxMaterial";
import { TexturePipelineSrc } from "../../../misc";
import { NestUniformValues } from "../../../shaders/uniformsUtils";

type CoverTextureUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   textureResolution: { value: THREE.Vector2 };
} & BasicFxUniforms;

export type CoverTextureValues = NestUniformValues<CoverTextureUniforms> &
   BasicFxValues;

export class CoverTextureMaterial extends BasicFxMaterial {
   static get type() {
      return "NoiseMaterial";
   }

   uniforms!: CoverTextureUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<CoverTextureValues> = {}) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            textureResolution: { value: new THREE.Vector2() },
         } as CoverTextureUniforms,
      });

      this.type = CoverTextureMaterial.type;
   }
}
