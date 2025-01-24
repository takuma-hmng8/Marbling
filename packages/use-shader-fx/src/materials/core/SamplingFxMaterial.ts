import * as THREE from "three";
import { FxMaterialProps } from "./FxMaterial";
import {
   NestUniformValues,
   UniformParentKey,
} from "../../shaders/uniformsUtils";
import { mergeShaderCode, mergeShaderLib } from "../../shaders/shaderUtils";
import { BasicFxMaterial } from "./BasicFxMaterial";
import * as BasicFxLib from "./BasicFxLib";

/*===============================================
types
===============================================*/
type SamplingFxUniformsUnique = {
   texture: { value: UniformParentKey };
   texture_src: { value: THREE.Texture };
   texture_resolution: { value: BasicFxLib.TextureResolution };
   texture_fit: { value: BasicFxLib.FitType };
   texture_aspectRatio: { value: number };
   texture_fitScale: { value: THREE.Vector2 };
};
export type SamplingFxUniforms = SamplingFxUniformsUnique &
   BasicFxLib.BasicFxUniforms;
export type SamplingFxValues = NestUniformValues<SamplingFxUniforms>;

/*===============================================
constants
===============================================*/
const SAMPLINGFX_VALUES: SamplingFxUniformsUnique = {
   texture: { value: true },
   texture_src: { value: new THREE.Texture() },
   texture_resolution: { value: null },
   texture_fit: { value: "fill" },
   texture_aspectRatio: { value: 0 },
   texture_fitScale: { value: new THREE.Vector2(1, 1) },
};

const SAMPLINGFX_SHADER_PREFIX = {
   texture: "#define USF_USE_TEXTURE",
};

/**
 * SamplingFxMaterialでは常にtextureはtrueであるはずなので、BasicFxMaterialを継承して、srcSystemは常にtrueになるように、継承する
 */
export class SamplingFxMaterial extends BasicFxMaterial {
   uniforms!: SamplingFxUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps<SamplingFxValues>) {
      super({
         vertexShader,
         fragmentShader,
         uniformValues,
         materialParameters,
         uniforms: THREE.UniformsUtils.merge([
            SAMPLINGFX_VALUES,
            uniforms || {},
         ]),
      });
   }

   handleMergeShaderLib(vertexShader?: string, fragmentShader?: string) {
      return mergeShaderLib(vertexShader, fragmentShader, "samplingFx");
   }

   isContainsBasicFxValues(values?: { [key: string]: any }): boolean {
      return super.isContainsBasicFxValues(values, {
         ...BasicFxLib.BASICFX_VALUES,
         ...SAMPLINGFX_VALUES,
      });
   }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const { srcAspectRatio, fitScale } = this.calcAspectRatio({
         type: this.uniforms.texture_fit.value,
         src: this.uniforms.texture_src.value,
         srcResolution: this.uniforms.texture_resolution.value,
      });

      this.uniforms.texture_aspectRatio.value = srcAspectRatio;
      this.uniforms.texture_fitScale.value = fitScale;
   }

   setUpFxKey(uniforms: BasicFxLib.BasicFxUniforms): BasicFxLib.FxKey {
      const key = super.setUpFxKey(uniforms);
      key.srcSystem = true;
      return key;
   }

   handleUpdateFxShaders(): {
      diffCount: number;
      newFxKey: BasicFxLib.FxKey;
   } {
      const { diffCount, newFxKey } = super.handleUpdateFxShaders();
      newFxKey.srcSystem = true;
      return {
         diffCount,
         newFxKey,
      };
   }

   handleUpdateFxShaderPrefixes(): {
      vertex: string;
      fragment: string;
   } {
      const prefix = super.handleUpdateFxShaderPrefixes();
      return {
         vertex: mergeShaderCode([
            prefix.vertex.trim(),
            SAMPLINGFX_SHADER_PREFIX.texture,
            "\n",
         ]),
         fragment: mergeShaderCode([
            prefix.fragment.trim(),
            SAMPLINGFX_SHADER_PREFIX.texture,
            "\n",
         ]),
      };
   }
}
