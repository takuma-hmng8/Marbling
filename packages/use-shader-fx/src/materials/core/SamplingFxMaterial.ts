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
   texture_fit: { value: BasicFxLib.FitType };
};
type SamplingFxUniformsFitScale = {
   texture_fitScale: { value: THREE.Vector2 };
};
export type SamplingFxUniforms = SamplingFxUniformsUnique &
   BasicFxLib.BasicFxUniforms;
export type SamplingFxValues = NestUniformValues<SamplingFxUniforms>;

/*===============================================
constants
===============================================*/
const SAMPLINGFX_VALUES: SamplingFxUniformsUnique & SamplingFxUniformsFitScale =
   {
      texture: { value: true },
      texture_src: { value: new THREE.Texture() },
      texture_fit: { value: "fill" },
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

   protected _handleMergeShaderLib(
      vertexShader?: string,
      fragmentShader?: string
   ) {
      return mergeShaderLib(vertexShader, fragmentShader, "samplingFx");
   }

   protected _isContainsBasicFxValues(values?: {
      [key: string]: any;
   }): boolean {
      return super._isContainsBasicFxValues(values, {
         ...BasicFxLib.BASICFX_VALUES,
         ...SAMPLINGFX_VALUES,
      });
   }

   protected _updateFitScale() {
      super._updateFitScale();
      this._setFitScale("texture");
   }

   protected _setupFxKey(
      uniforms: BasicFxLib.BasicFxUniforms
   ): BasicFxLib.FxKey {
      const key = super._setupFxKey(uniforms);
      key.srcSystem = true;
      return key;
   }

   protected _handleUpdateFxShaders(): {
      diffCount: number;
      newFxKey: BasicFxLib.FxKey;
   } {
      const { diffCount, newFxKey } = super._handleUpdateFxShaders();
      newFxKey.srcSystem = true;
      return {
         diffCount,
         newFxKey,
      };
   }

   protected _handleUpdateFxShaderPrefixes(): {
      vertex: string;
      fragment: string;
   } {
      const prefix = super._handleUpdateFxShaderPrefixes();
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
