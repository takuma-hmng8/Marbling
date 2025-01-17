import * as THREE from "three";
import { FxMaterialProps } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";
import { NestUniformValues } from "../../shaders/uniformsUtils";
import { joinShaderPrefix } from "../../shaders/mergeShaderLib";
import {
   BasicFxMaterial,
   BasicFxValues,
   BasicFxUniforms,
   FxFlag as BasicFxFlag,
   FitType,
} from "./BasicFxMaterial";
import { DEFAULT_TEXTURE } from "../../libs/constants";

type SamplingFxUniformsUnique = {
   // texture
   texture_src: { value: TexturePipelineSrc };
   texture_resolution: { value: THREE.Vector2 };
   texture_fit: { value: FitType };
} & typeof BasicFxMaterial.BASIC_VALUES;

export type SamplingFxUniforms = {
   texture_aspectRatio: { value: number };
   texture_fitScale: { value: THREE.Vector2 };
} & SamplingFxUniformsUnique &
   BasicFxUniforms;

export type SamplingFxValues = NestUniformValues<SamplingFxUniformsUnique> &
   BasicFxValues;

export type SamplingFxFlag = {
   texture: boolean;
} & BasicFxFlag;

/*===============================================
TODO 
- てか、SamplingFxMaterialのtextureって常にtrueでいいんじゃね
===============================================*/

export class SamplingFxMaterial extends BasicFxMaterial {
   static readonly BASIC_VALUES = {
      ...BasicFxMaterial.BASIC_VALUES,
      texture_src: { value: DEFAULT_TEXTURE },
      texture_resolution: { value: new THREE.Vector2(0) },
      texture_fit: { value: "fill" },
      texture_aspectRatio: { value: 0 },
      texture_fitScale: { value: new THREE.Vector2(1, 1) },
   };

   static readonly SHADER_PREFIX = {
      ...BasicFxMaterial.SHADER_PREFIX,
      texture: "#define USF_USE_TEXTURE",
   };

   fxFlag: SamplingFxFlag;

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

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;

      this.fxFlag = this.setupDefaultFlag(uniformValues);

      this.setupFxShaders(vertexShader, fragmentShader, "samplingFx");
   }
   /*===============================================
	↓↓ BasicFxMaterialの拡張 ↓↓
	===============================================*/
   // isContainsBasicValues(values?: { [key: string]: any }): boolean {
   //    return this.filterBasicValues(
   //       values ?? null,
   //       SamplingFxMaterial.BASIC_VALUES
   //    );
   // }

   updateResolution(resolution: THREE.Vector2) {
      super.updateResolution(resolution);

      const textureAspect = this.calcAspectRatio(
         this.uniforms.texture_fit?.value,
         this.uniforms.texture_src?.value,
         this.uniforms.texture_resolution?.value
      );

      this.uniforms.texture_aspectRatio.value = textureAspect.srcAspectRatio;
      this.uniforms.texture_fitScale.value = textureAspect.fitScale;
   }

   // TODO ここの継承ももっとスマートに工夫する
   setupDefaultFlag(uniformValues?: SamplingFxValues): SamplingFxFlag {
      const isMixSrc = uniformValues?.mixSrc ? true : false;
      const isMixDst = uniformValues?.mixDst ? true : false;
      const isTexture = uniformValues?.texture ? true : false;
      const isSrcSystem = isMixSrc || isMixDst || isTexture;
      return {
         mixSrc: isMixSrc,
         mixDst: isMixDst,
         texture: isTexture,
         srcSystem: isSrcSystem,
      };
   }

   handleUpdateFxShaders(
      uniforms: SamplingFxUniforms,
      fxFlag: SamplingFxFlag
   ): {
      validCount: number;
      updatedFlag: SamplingFxFlag;
   } {
      const { validCount: parentValidCount, updatedFlag: parentUpdateFlag } =
         super.handleUpdateFxShaders(
            uniforms as BasicFxUniforms,
            fxFlag as BasicFxFlag
         );

      let localValidCount = 0;
      fxFlag = {
         ...parentUpdateFlag,
         ...fxFlag,
      };

      const { texture } = fxFlag;

      // textureの判定
      const isTexture = uniforms.texture_src.value ? true : false;
      if (texture !== isTexture) {
         fxFlag.texture = isTexture;
         localValidCount++;
      }

      // srcSystemの再判定 (mixSrc, mixDst, textureがいずれかtrueならsrcSystem)
      const { mixSrc, mixDst } = fxFlag;
      const isSrcSystem = mixSrc || mixDst || isTexture;
      if (fxFlag.srcSystem !== isSrcSystem) {
         fxFlag.srcSystem = isSrcSystem;
         localValidCount++;
      }

      return {
         validCount: parentValidCount + localValidCount,
         updatedFlag: fxFlag,
      };
   }

   handleUpdateFxShaderPrefixes(fxFlag: SamplingFxFlag): {
      prefixVertex: string;
      prefixFragment: string;
   } {
      // 親の処理を実行
      const {
         prefixVertex: parentPrefixVertex,
         prefixFragment: parentPrefixFragment,
      } = super.handleUpdateFxShaderPrefixes(fxFlag);

      // texture用prefixの追加
      const texturePrefix = fxFlag.texture
         ? SamplingFxMaterial.SHADER_PREFIX.texture
         : "";

      const prefixVertex = joinShaderPrefix([
         parentPrefixVertex.trim(),
         texturePrefix,
         "\n",
      ]);

      const prefixFragment = joinShaderPrefix([
         parentPrefixFragment.trim(),
         texturePrefix,
         "\n",
      ]);

      return {
         prefixVertex,
         prefixFragment,
      };
   }
}
