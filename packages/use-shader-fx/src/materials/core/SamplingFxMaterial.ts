import * as THREE from "three";
import { FxMaterialProps } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import { NestUniformValues } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import {
   BasicFxMaterial,
   BasicFxValues,
   BasicFxUniforms,
   FxFlag,
   FitType,
   BasicFxUniformsUnique,
   hasMatchingKeys,
} from "./BasicFxMaterial";
import { DEFAULT_TEXTURE } from "../../libs/constants";

type SamplingFxUniformsUnique = {
   texture_src: { value: TexturePipelineSrc };
   texture_resolution: { value: THREE.Vector2 };
   texture_fit: { value: FitType };
   texture_aspectRatio: { value: number };
   texture_fitScale: { value: THREE.Vector2 };
} & BasicFxUniformsUnique;

export type SamplingFxUniforms = SamplingFxUniformsUnique & BasicFxUniforms;

export type SamplingFxValues = NestUniformValues<SamplingFxUniforms>;

export class SamplingFxMaterial extends BasicFxMaterial {
   static readonly BASIC_VALUES: SamplingFxUniformsUnique = {
      ...BasicFxMaterial.BASIC_VALUES,
      texture_src: { value: DEFAULT_TEXTURE },
      texture_resolution: { value: new THREE.Vector2() },
      texture_fit: { value: "fill" },
      texture_aspectRatio: { value: 0 },
      texture_fitScale: { value: new THREE.Vector2(1, 1) },
   };

   static readonly SHADER_PREFIX = {
      ...BasicFxMaterial.SHADER_PREFIX,
      texture: "#define USF_USE_TEXTURE",
   };

   uniforms!: SamplingFxUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps<SamplingFxValues>) {
      super({
         uniformValues,
         materialParameters,
         uniforms: THREE.UniformsUtils.merge([
            SamplingFxMaterial.BASIC_VALUES,
            uniforms || {},
         ]),
      });

      this.setupFxShaders(vertexShader, fragmentShader, "samplingFx");
   }
   /*===============================================
	↓↓ BasicFxMaterialの拡張 ↓↓
	===============================================*/
   isContainsBasicValues(values?: { [key: string]: any }): boolean {
      return hasMatchingKeys(values ?? null, SamplingFxMaterial.BASIC_VALUES);
   }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const { srcAspectRatio, fitScale } = this.calcAspectRatio(
         this.uniforms.texture_fit.value,
         this.uniforms.texture_src.value,
         this.uniforms.texture_resolution.value
      );

      this.uniforms.texture_aspectRatio.value = srcAspectRatio;
      this.uniforms.texture_fitScale.value = fitScale;
   }

   // srcSystemは常にtrueで返す;
   setupDefaultFlag(uniformValues: BasicFxValues): FxFlag {
      const flag = super.setupDefaultFlag(uniformValues);
      flag.srcSystem = true;
      return flag;
   }

   handleUpdateFxShaders(
      uniforms: SamplingFxUniforms,
      fxFlag: FxFlag
   ): {
      validCount: number;
      updatedFlag: FxFlag;
   } {
      const { validCount, updatedFlag } = super.handleUpdateFxShaders(
         uniforms,
         fxFlag
      );
      updatedFlag.srcSystem = true;
      return {
         validCount,
         updatedFlag,
      };
   }

   handleUpdateFxShaderPrefixes(fxFlag: FxFlag): {
      prefixVertex: string;
      prefixFragment: string;
   } {
      // 親の処理を実行
      const { prefixVertex, prefixFragment } =
         super.handleUpdateFxShaderPrefixes(fxFlag);

      // texture用prefixの追加
      const texturePrefix = SamplingFxMaterial.SHADER_PREFIX.texture;

      return {
         prefixVertex: joinShaderPrefix([
            prefixVertex.trim(),
            texturePrefix,
            "\n",
         ]),
         prefixFragment: joinShaderPrefix([
            prefixFragment.trim(),
            texturePrefix,
            "\n",
         ]),
      };
   }
}
